import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import CourseCard from '../components/CourseCard';
import MaterialIcon from '../components/MaterialIcon';

const initialFilters = { search: '', category: '', level: '' };

const Courses = () => {
    const location = useLocation();
    const incomingSearch = location.state?.search || '';
    const incomingCategory = location.state?.category || '';
    const [allCourses, setAllCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({ ...initialFilters, search: incomingSearch, category: incomingCategory });
    const [sort, setSort] = useState('catalog');
    const [view, setView] = useState('grid');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            setLoading(true);
            try {
                const [coursesResponse, categoriesResponse] = await Promise.all([
                    api.get('/courses'),
                    api.get('/courses/categories')
                ]);
                setAllCourses(coursesResponse.data);
                setCategories(categoriesResponse.data);
                setErrorMessage('');
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };

        void loadCourses();
    }, []);

    useEffect(() => {
        setFilters((current) => ({ ...current, search: incomingSearch, category: incomingCategory }));
    }, [incomingSearch, incomingCategory]);

    const levels = useMemo(
        () => [...new Set(allCourses.map((course) => course.level).filter(Boolean))],
        [allCourses]
    );

    const visibleCourses = useMemo(() => {
        const search = filters.search.trim().toLowerCase();
        const filtered = allCourses.filter((course) => {
            const searchableText = [course.title, course.description, course.category, course.level]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return (!search || searchableText.includes(search))
                && (!filters.category || course.category === filters.category)
                && (!filters.level || course.level === filters.level);
        });

        return [...filtered].sort((first, second) => {
            if (sort === 'title-asc') return first.title.localeCompare(second.title);
            if (sort === 'title-desc') return second.title.localeCompare(first.title);
            if (sort === 'category') return (first.category || '').localeCompare(second.category || '');
            if (sort === 'level') return (first.level || '').localeCompare(second.level || '');
            return 0;
        });
    }, [allCourses, filters, sort]);

    const activeFilters = [
        filters.search && { key: 'search', label: `Search: ${filters.search}` },
        filters.category && { key: 'category', label: filters.category },
        filters.level && { key: 'level', label: filters.level }
    ].filter(Boolean);

    const handleChange = (event) => {
        setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const clearFilter = (key) => {
        setFilters((current) => ({ ...current, [key]: '' }));
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setSort('catalog');
    };

    return (
        <main className="page catalog-page">
            <div className="page-header fade-up">
                <p className="eyebrow">Course catalog</p>
                <h1>Discover the right course for your next skill.</h1>
                <p className="page-subtitle">Search the live catalog, narrow it by category or level, and choose the view that works for you.</p>
            </div>

            <Alert type="error" message={errorMessage} />

            <div className="catalog-overview fade-up" aria-label="Catalog summary">
                <div className="catalog-overview-card"><strong>{allCourses.length}</strong><span>Courses available</span></div>
                <div className="catalog-overview-card"><strong>{categories.length}</strong><span>Categories</span></div>
                <div className="catalog-overview-card"><strong>{levels.length}</strong><span>Learning levels</span></div>
            </div>

            <form className="filter-bar catalog-filter-panel fade-up" onSubmit={(event) => event.preventDefault()}>
                <div className="catalog-search-field">
                    <MaterialIcon name="search" />
                    <label className="sr-only" htmlFor="catalog-search">Search courses</label>
                    <input id="catalog-search" type="search" name="search" placeholder="Search titles, descriptions, categories, or levels" value={filters.search} onChange={handleChange} />
                    {filters.search && <button type="button" aria-label="Clear search" onClick={() => clearFilter('search')}><MaterialIcon name="close" /></button>}
                </div>

                <div className="catalog-filter-grid">
                    <label>
                        <span>Category</span>
                        <select name="category" value={filters.category} onChange={handleChange}>
                            <option value="">All categories</option>
                            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                        </select>
                    </label>
                    <label>
                        <span>Level</span>
                        <select name="level" value={filters.level} onChange={handleChange}>
                            <option value="">All levels</option>
                            {levels.map((level) => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </label>
                    <label>
                        <span>Sort by</span>
                        <select value={sort} onChange={(event) => setSort(event.target.value)}>
                            <option value="catalog">Catalog order</option>
                            <option value="title-asc">Title A-Z</option>
                            <option value="title-desc">Title Z-A</option>
                            <option value="category">Category</option>
                            <option value="level">Level</option>
                        </select>
                    </label>
                </div>

                <div className="catalog-filter-footer">
                    <div className="active-filter-list" aria-label="Active filters">
                        {activeFilters.length ? activeFilters.map((filter) => (
                            <button type="button" key={filter.key} onClick={() => clearFilter(filter.key)}>
                                {filter.label} <MaterialIcon name="close" />
                            </button>
                        )) : <span>No filters applied</span>}
                    </div>
                    <button className="catalog-reset" type="button" onClick={resetFilters} disabled={!activeFilters.length && sort === 'catalog'}>
                        <MaterialIcon name="restart_alt" /> Reset all
                    </button>
                </div>
            </form>

            <div className="catalog-results-toolbar">
                <div>
                    <p className="eyebrow">Available now</p>
                    <h2>{loading ? 'Loading courses...' : `${visibleCourses.length} course${visibleCourses.length === 1 ? '' : 's'} found`}</h2>
                </div>
                <div className="catalog-view-toggle" role="group" aria-label="Course view">
                    <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><MaterialIcon name="grid_view" /></button>
                    <button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}><MaterialIcon name="view_agenda" /></button>
                </div>
            </div>

            <div className={`course-grid catalog-course-results ${view === 'list' ? 'catalog-list-view' : ''}`}>
                {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="loading-card" />) : visibleCourses.length ? (
                    visibleCourses.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)
                ) : (
                    <div className="empty-state catalog-empty-state">
                        <MaterialIcon name="search_off" />
                        <h3>No matching courses</h3>
                        <p>Try a different search or clear the current filters.</p>
                        <button type="button" className="btn-primary" onClick={resetFilters}>Clear filters</button>
                    </div>
                )}
            </div>

            {!loading && allCourses.length === 0 && (
                <div className="catalog-browse-contact"><span>Looking for a course that is not listed?</span><Link to="/contact">Send a request <MaterialIcon name="arrow_forward" /></Link></div>
            )}
        </main>
    );
};

export default Courses;
