import { Link } from 'react-router-dom';
import { getCourseImage } from '../utils/media';
import MaterialIcon from './MaterialIcon';

const CourseCard = ({ course, index = 0 }) => {
    const imageUrl = getCourseImage(course, index);

    return (
        <article className="course-card fade-up">
            <div className="course-card-media">
                {imageUrl ? <img src={imageUrl} alt={course.title} /> : <div className="course-card-placeholder"><MaterialIcon name="auto_stories" /></div>}
            </div>
            <div className="course-card-body">
                {(course.category || course.level) && <div className="course-card-topline">
                    {course.category && <span className="badge">{course.category}</span>}
                    {course.level && <span className="meta-pill alt">{course.level}</span>}
                </div>}
                <h3>{course.title}</h3>
                {course.description && <p>{course.description.slice(0, 96)}{course.description.length > 96 ? '...' : ''}</p>}
                <div className="course-card-actions">
                    <Link to={`/courses/${course.id}`} className="btn-primary">View Course <MaterialIcon name="arrow_forward" /></Link>
                </div>
            </div>
        </article>
    );
};

export default CourseCard;
