import "./App.css";
import { AppContextProvider } from "./contexts";
import { Gateway } from "./components/Gateway";

export const App = () => {
    return (
        <AppContextProvider>
            <div className="App">
                <Gateway />
            </div>
        </AppContextProvider>
    );
}