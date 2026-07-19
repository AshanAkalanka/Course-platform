import { useEffect, useRef } from 'react';
import MaterialIcon from './MaterialIcon';

const AdminFormModal = ({ open, onClose, icon, eyebrow, title, children, wide = false, disableClose = false }) => {
    const closeRef = useRef(onClose);

    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !disableClose) closeRef.current();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [disableClose, open]);

    if (!open) return null;

    const requestClose = () => {
        if (!disableClose) onClose();
    };

    return (
        <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && requestClose()}>
            <section className={`admin-course-modal admin-form-modal${wide ? ' admin-form-modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="admin-form-modal-title">
                <div className="admin-modal-header">
                    <div>
                        <span className="admin-modal-icon"><MaterialIcon name={icon} /></span>
                        <div><p>{eyebrow}</p><h2 id="admin-form-modal-title">{title}</h2></div>
                    </div>
                    <button type="button" className="admin-modal-close" onClick={requestClose} disabled={disableClose} aria-label={`Close ${title}`}><MaterialIcon name="close" /></button>
                </div>
                {children}
            </section>
        </div>
    );
};

export default AdminFormModal;
