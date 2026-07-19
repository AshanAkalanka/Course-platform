export const DEFAULT_CATEGORY_NAMES = Object.freeze([
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

const CATEGORY_VISUALS = Object.freeze({
    'web development': {
        label: 'Technology',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=84'
    },
    'software engineering': {
        label: 'Engineering',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=84'
    },
    'information technology': {
        label: 'Technology',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=84'
    },
    'data science': {
        label: 'Analytics',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=84'
    },
    'ui/ux design': {
        label: 'Design',
        image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=84'
    },
    cybersecurity: {
        label: 'Security',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=84'
    },
    mathematics: {
        label: 'Core Studies',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=84'
    },
    science: {
        label: 'Core Studies',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=84'
    },
    business: {
        label: 'Professional',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=84'
    },
    'digital marketing': {
        label: 'Professional',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=84'
    },
    languages: {
        label: 'Communication',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=84'
    },
    'personal development': {
        label: 'Growth',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=84'
    }
});

const CUSTOM_CATEGORY_IMAGES = Object.freeze([
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=84',
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=84',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=84',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=84'
]);

export const isDefaultCategory = (name = '') => DEFAULT_CATEGORY_NAMES.some(
    (category) => category.toLowerCase() === name.trim().toLowerCase()
);

export const getCategoryVisual = (name = '', index = 0) => (
    CATEGORY_VISUALS[name.trim().toLowerCase()] || {
        label: 'Community Category',
        image: CUSTOM_CATEGORY_IMAGES[index % CUSTOM_CATEGORY_IMAGES.length]
    }
);
