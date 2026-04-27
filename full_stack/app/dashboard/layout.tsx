import Side from '../components/Sidebar1'
import Navbar from '../components/LoggedNavbar'

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-screen flex no-scrollbar overflow-y-auto">
            <div className="h-full">
                <Side children={undefined} />
            </div>
            <div className='flex-1 flex flex-col'>
                <div>
                    <Navbar />
                </div>
                <main className=''>
                    {children}
                </main>
            </div>
        </div>
    );
}

