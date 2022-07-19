import "./style/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Switch, Route } from "react-router-dom";
import { useState, useMemo } from "react";

import AddOrder from "./pages/addOrder";
import Login from "./pages/login";
import EditOrder from "./pages/editOrder";
import OrdersList from "./pages/ordersList";
import ScanOrder from "./pages/scanOrder";
import Profile from "./pages/profile";
import PrintOrder from "./pages/printOrder";
import AddUser from "./pages/addUser";

import Header from "./components/header/header";
import Background from "./components/background";
import Refresh from "./components/refresh";
import DemoLogIn from "./components/demoLogIn";
import UserContext from "./components/userContext";
import Welcome from "./pages/welcome";

function App() {
  const [userDisplay, setUserDisplay] = useState("");
  const value = useMemo(() => ({ userDisplay, setUserDisplay }), [userDisplay]);

  return (
    <>
      <Background />

      {/* Header doesn't use UserContext.Provider value directly, but instead updates and rerenders when other components (primarily DemoLogIn) change the value */}
      <UserContext.Provider value={value}>
        <Header />
      </UserContext.Provider>

      <main className="mainContainer">
        <UserContext.Provider value={value}>
          <Switch>
            <Route exact path={["/"]}>
              <OrdersList />
            </Route>
            {/* DemoLogIn should be removed prior to production */}
            <Route
              path={["/demoLogin", "/*/demoLogin"]}
              component={DemoLogIn}
            />
            <Route exact path="/welcome" component={Welcome} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/print/:id" component={PrintOrder} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/scan/:id" component={ScanOrder} />
            <Route exact path="/orders/:id" component={EditOrder} />
            <Route exact path="/users/add" component={AddUser} />
            <Route exact path="/add" component={AddOrder} />
            {/* Refresh should be removed prior to production */}
            <Route exact path="/refresh" component={Refresh} />
            {/* the first OrderList route exists to handle simultanous use of searchParams and demoLogin searchParams
            the second Orderlist route catches typoed URLs */}
            <Route path={["/"]} component={OrdersList} />
          </Switch>
        </UserContext.Provider>
      </main>
      {/* */}
      <footer className="footer-container"></footer>
    </>
  );
}

export default App;
