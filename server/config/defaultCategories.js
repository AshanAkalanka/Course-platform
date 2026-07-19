const DEFAULT_CATEGORIES = Object.freeze([
    'Web Development',
    'Software Engineering',
    'Information Technology',
    'Data Science',
    'UI/UX Design',
    'Cybersecurity',
    'Mathematics',
    'Science',
    'Business',
    'Digital Marketing',
    'Languages',
    'Personal Development'
]);

const isDefaultCategory = (name = '') => DEFAULT_CATEGORIES.some(
    (category) => category.toLowerCase() === name.trim().toLowerCase()
);

const mergeWithDefaultCategories = (categories = []) => {
    const seen = new Set();

    return [...DEFAULT_CATEGORIES, ...categories].filter((category) => {
        const key = category.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

module.exports = {
    DEFAULT_CATEGORIES,
    isDefaultCategory,
    mergeWithDefaultCategories
};
