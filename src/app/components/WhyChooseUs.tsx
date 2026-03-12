import { Utensils, Award, Truck } from 'lucide-react';
import styles from './WhyChooseUs.module.css';

export default function WhyChooseUs() {
    const features = [
        {
            icon: <Utensils size={48} className={styles.icon} />,
            title: 'Serve Healthy Food',
            description: 'We will offer healthy food to be right for client fitness and health.'
        },
        {
            icon: <Award size={48} className={styles.icon} />,
            title: 'Best Quality',
            description: 'We will strive to serve best quality meals, with celebrity food ingredients.'
        },
        {
            icon: <Truck size={48} className={styles.icon} />,
            title: 'Fast Delivery',
            description: 'We can deliver food immediately, we make sure the team can do the job.'
        }
    ];

    return (
        <section className={styles.section}>
            <div className={`container ${styles.container}`}>
                <h2 className={styles.heading}>Why <span className={styles.highlight}>Choose US?</span></h2>
                <div className={styles.subtitleWrapper}>
                    <p className={styles.subtitle}>Bringing quality and health to your doorstep with every single bite.</p>
                </div>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.iconWrapper}>
                                {feature.icon}
                            </div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDesc}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
