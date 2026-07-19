import MaterialIcon from './MaterialIcon';

const Alert = ({ type = 'error', message }) => {
    if (!message) return null;

    const icon = type === 'success' ? 'check_circle' : type === 'warning' ? 'warning' : type === 'info' ? 'info' : 'error';

    return (
        <div className={`alert-box ${type}`}>
            <MaterialIcon name={icon} filled />
            <span>{message}</span>
        </div>
    );
};

export default Alert;
