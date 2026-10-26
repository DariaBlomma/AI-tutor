import { createFileRoute } from '@tanstack/react-router';
import {TeacherHomeView} from "@/teacher/ui/views/TeacherHomeView/TeacherHomeView";
import {StudentHomeView} from "@/student/ui/views/StudentHomeView/StudentHomeView";
import {AuthService} from "@/auth/services/AuthService.ts";

export const Route = createFileRoute('/')({
    loader: () => ({isTeacher: AuthService.getUserRole() === 'TEACHER'}),
    component: Home,
});

// Главная по роли: учитель -> страница учителя, остальные -> страница ученика.
function Home() {
    const {isTeacher} = Route.useLoaderData();
    return isTeacher ? <TeacherHomeView/> : <StudentHomeView/>;
}
