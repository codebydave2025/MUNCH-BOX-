import Link from 'next/link';
import { Instagram, Send, Music2 } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.column}>
                    <h3 className={styles.logo}>MUNCHBOX</h3>
                    <p className={styles.text}>
                        Good Food, Good Mood. We deliver the best quality food to your doorstep.
                    </p>
                    <div className={styles.socials}>
                        <a href="https://instagram.com/munchbox_vuna" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Instagram"><Instagram size={20} /></a>
                        <a href="https://tiktok.com/@munch__box" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="TikTok"><Music2 size={20} /></a>
                    </div>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>Explore</h4>
                    <ul className={styles.list}>
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/menu">Menu</Link></li>
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="/contact">Contact & Reviews</Link></li>
                        <li><Link href="/tracking">Track Order</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>Contact</h4>
                    <ul className={styles.list}>
                        <li>Veritas University, Bwari, Abuja</li>
                        <li>+234 800 MUNCHBOX</li>
                        <li>Munchbox.ltd@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div className={styles.bottom}>
                <p>&copy; {new Date().getFullYear()} MUNCHBOX. All rights reserved.</p>
            </div>
        </footer>
    );
}
