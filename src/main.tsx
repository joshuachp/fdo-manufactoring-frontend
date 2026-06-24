import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App, { rvInfoLoader } from './App.tsx'
import { EditRvInfo } from './app/rvinfo.tsx'

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        loader: rvInfoLoader
    },
    {
        path: "/rvinfo",
        element: <EditRvInfo />,
        loader: rvInfoLoader
    },
    {
        path: "/devices",
        element: <h1 >Devices</h1>
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)
