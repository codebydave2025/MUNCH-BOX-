import fs from 'fs/promises';
import { existsSync } from 'fs';

const isVercel = process.env.VERCEL === '1';

/**
 * WriteQueue - Serialises concurrent writes to the same file.
 */
class WriteQueue {
    private queues: Map<string, Promise<void>> = new Map();

    async enqueue(filePath: string, task: () => Promise<void>): Promise<void> {
        const current = this.queues.get(filePath) ?? Promise.resolve();
        const next = current.then(() => task()).catch(() => task());
        this.queues.set(filePath, next);
        return next;
    }
}

const writeQueue = new WriteQueue();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * atomicUpdate - Safely reads, modifies, and writes data in one queued task.
 * This prevents race conditions where two processes read the same state and overwrite each other.
 */
export async function atomicUpdate(filePath: string, updater: (data: any) => any) {
    if (isVercel) {
        console.warn('Vercel environment detected: Persistence is disabled for JSON files. Data will be temporary.');
        return updater([]); // Still run updater on empty/fallback
    }

    return writeQueue.enqueue(filePath, async () => {
        let retries = 5;
        while (retries > 0) {
            try {
                // Read current data
                let currentData = [];
                if (existsSync(filePath)) {
                    const content = await fs.readFile(filePath, 'utf8');
                    if (content && content.trim() !== '') {
                        try {
                            currentData = JSON.parse(content);
                        } catch (e) {
                            console.error(`Error parsing ${filePath} during update:`, e);
                            // If corrupted, we might want to backup or start fresh
                            // For now, let's assume we start fresh or it's a critical error
                        }
                    }
                }

                // Apply updates
                const updatedData = await updater(currentData);

                // Write back
                const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
                const content = JSON.stringify(updatedData, null, 2);
                await fs.writeFile(tempPath, content, 'utf8');
                await fs.rename(tempPath, filePath);
                return updatedData;
            } catch (error: any) {
                retries--;
                if (retries === 0 || !['EBUSY', 'EPERM', 'EACCES'].includes(error.code)) {
                    console.error(`Failed to atomicUpdate ${filePath}:`, error);
                    throw error;
                }
                await delay(150); // Wait before retry
            }
        }
    });
}

/**
 * atomicWrite - Writes data safely. Skips write on Vercel to avoid deployment errors.
 * Includes retry logic for Windows file locks.
 */
export async function atomicWrite(filePath: string, data: any) {
    if (isVercel) {
        console.warn('Vercel environment detected: Persistence is disabled for JSON files. Data will be temporary.');
        return;
    }

    return writeQueue.enqueue(filePath, async () => {
        let retries = 5;
        while (retries > 0) {
            try {
                const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
                const content = JSON.stringify(data, null, 2);
                await fs.writeFile(tempPath, content, 'utf8');
                await fs.rename(tempPath, filePath);
                return; // Success
            } catch (error: any) {
                retries--;
                if (retries === 0 || !['EBUSY', 'EPERM', 'EACCES'].includes(error.code)) {
                    console.error(`Failed to write to ${filePath}:`, error);
                    break;
                }
                await delay(150); // Wait before retry
            }
        }
    });
}

export async function safeRead(filePath: string, fallback: any = []) {
    let retries = 5;
    while (retries > 0) {
        try {
            if (!existsSync(filePath)) {
                return fallback;
            }
            const content = await fs.readFile(filePath, 'utf8');
            if (!content || content.trim() === '') return fallback;

            try {
                return JSON.parse(content);
            } catch (parseError) {
                console.error(`CRITICAL: JSON parse error in ${filePath}. Data may be corrupted.`);
                throw parseError;
            }
        } catch (error: any) {
            if (['EBUSY', 'EPERM', 'EACCES'].includes(error.code)) {
                retries--;
                if (retries > 0) {
                    await delay(150);
                    continue;
                }
            }
            throw error;
        }
    }
    return fallback;
}
