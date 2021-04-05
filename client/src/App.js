import "./App.css";
import { AppContextProvider } from "./contexts";
import { Gateway } from "./components/Gateway";
import { Guest } from "./components/Guest";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

export const App = () => {
    return (
        <AppContextProvider>
            <Router>
                <Switch>
                    <Route path="/signup">
                        <Guest signup={true} />
                    </Route>
                    <Route path="/">
                        <div className="App">
                            <Gateway />
                        </div>
                    </Route>
                </Switch>
            </Router>
        </AppContextProvider>
    );
}