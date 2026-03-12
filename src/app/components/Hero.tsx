import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Welcome to <br />
                        <span className={styles.highlightYellow}>MunchBox</span> – <br />
                        Come Grab & <br />
                        Order Fresh!
                    </h1>
                    <p className={styles.description}>
                        Now you will find best quality and fresh food from order to your doorstep.
                        Let us give the best service to you. Good Food, Good Mood.
                    </p>
                    <div className={styles.buttons}>
                        <Link href="/menu" className="btn btn-primary" style={{ minWidth: '160px' }}>
                            Order Now
                        </Link>
                        <Link href="/menu" className="btn btn-outline" style={{ minWidth: '160px' }}>
                            Explore More
                        </Link>
                    </div>

                    <div className={styles.stats}>
                        {/* Optional stats/trust badges could go here */}
                    </div>
                </div>

                <div className={styles.imageWrapper}>
                    <div className={styles.circleBg}></div>
                    <Image
                        src="/INTRODUCING NEW BURGER MENU (1)-Photoroom.png"
                        alt="New Burger Menu"
                        width={2000}
                        height={2000}
                        className={styles.foodImage}
                        priority
                    />
                </div>
            </div>
        </section>
    );
}