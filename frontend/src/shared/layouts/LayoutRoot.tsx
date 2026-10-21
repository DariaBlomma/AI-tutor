import {Outlet,} from "@tanstack/react-router";


export function LayoutRoot() {

    return (
        <main className="main">

            <Outlet />
        </main>
    );
}