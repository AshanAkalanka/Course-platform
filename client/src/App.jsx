import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/HomeLive';
import Auth from './pages/Auth';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import MyLearning from './pages/MyLearning';
import WatchLesson from './pages/WatchLesson';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboardEduFlow';
import AdminCourses from './pages/AdminCourses';
import AdminLessons from './pages/AdminLessons';
import AdminUsers from './pages/AdminUsers';
import AdminMessages from './pages/AdminMessages';
import AdminEnrollments from './pages/AdminEnrollments';
import AdminCourseMaterials from './pages/AdminCourseMaterials';
import AdminNotifications from './pages/AdminNotifications';
import AdminLayout from './components/AdminShell';
import Contact from './pages/Contact';
import About from './pages/About';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';
import { useAuth } from './context/useAuth';

const HomeRedirect = () => {
    const { user } = useAuth();
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Home />;
};

const AppLayout = () => {
    const location = useLocation();
    const footerlessRoutes = ['/login', '/register'];
    const showFooter = !location.pathname.startsWith('/admin')
        && !location.pathname.startsWith('/watch/')
        && !footerlessRoutes.includes(location.pathname);

    return (
        <div className="app-shell">
            <Navbar />
            <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />

                <Route
                    path="/my-learning"
                    element={
                        <ProtectedRoute>
                            <MyLearning />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/watch/:id"
                    element={
                        <ProtectedRoute>
                            <WatchLesson />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="lessons" element={<AdminLessons />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="enrollments" element={<AdminEnrollments />} />
                    <Route path="materials" element={<AdminCourseMaterials />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                </Route>
            </Routes>
            {showFooter && <Footer />}
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
}

export default App;
