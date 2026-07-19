const MaterialIcon = ({ name, filled = false, className = '', title }) => (
    <span
        className={`material-symbols-outlined app-icon${filled ? ' app-icon-filled' : ''}${className ? ` ${className}` : ''}`}
        aria-hidden={title ? undefined : 'true'}
        aria-label={title}
        title={title}
    >
        {name}
    </span>
);

export default MaterialIcon;
