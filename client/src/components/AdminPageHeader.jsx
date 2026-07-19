import MaterialIcon from './MaterialIcon';

const AdminPageHeader = ({ icon, eyebrow, title, description, badge, tone = 'blue' }) => (
    <header className={`admin-page-hero admin-page-hero-${tone} fade-up`}>
        <span className="admin-page-hero-icon" aria-hidden="true">
            <MaterialIcon name={icon} />
        </span>
        <div className="admin-page-hero-copy">
            <p className="eyebrow">{eyebrow}</p>
            <h1>
                {title}
                {badge}
            </h1>
            <p>{description}</p>
        </div>
    </header>
);

export default AdminPageHeader;
