import NavBar from "../NavBar";

const HomePage = () => {
    return (
        <div>
            <div id="NavBar">
                <NavBar />
            </div>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1>Home Page</h1>
            </div>
        </div>
    );
}

export default HomePage;