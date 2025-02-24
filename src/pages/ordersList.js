import React, { useState, useEffect } from "react";
import OrderDataService from "../service/orderService";
import { Link } from "react-router-dom";
import styles from "../style/orders.module.css";
import AuthService from "../service/authService";
import { useSortableData } from "../components/sorting/sortHook";
import { TableHeader } from "../components/tableHeader";
import Gauge from "../components/gauge";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [searchTitle, setSearchTitle] = useState("");
  const [popUpBox, setPopUpbox] = useState("none");
  const [errorMessage, setErrorMessage] = useState("");
  const [sortedField, setSortedField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [sortType, setSortType] = useState("numeric");
  const [loading, setLoading] = useState(false);

  const sortOptions = { sortedField, sortDir, sortType };
  const sortedOrders = useSortableData(orders, sortOptions);

  //retrieve orders based on authorization level
  const retrieveOrders = () => {
    let serviceCall = () => {
      return OrderDataService.getAll().then((response) => {
        setOrders(response.data.orders);
        setLoading(false);
      });
    };
    try {
      AuthService.refreshTokenWrapperFunction(serviceCall);
    } catch (e) {
      setErrorMessage(e.message);
      setPopUpbox("block");
    }
  };

  useEffect(() => {
    const retrieveOrders = () => {
      let serviceCall = () => {
        return OrderDataService.getAll().then((response) => {
          setOrders(response.data.orders);
          setLoading(false);
        });
      };
      AuthService.refreshTokenWrapperFunction(serviceCall);
    };
    retrieveOrders();
    setLoading(true);
  }, []);

  function onChangeSearchTitle(e) {
    const searchTitle = e.target.value;
    console.log(e);
    setSearchTitle(searchTitle);
  }

  const refreshList = () => {
    retrieveOrders();
    setCurrentOrder(null);
  };

  const setActiveOrder = (order, index) => {
    if (
      currentOrder == null ||
      currentOrder.order_number !== order.order_number
    ) {
      setCurrentOrder(order, index);
    } else {
      setCurrentOrder(null);
    }
  };

  const removeAllOrders = () => {
    let serviceCall = () => {
      return OrderDataService.removeAll().then((response) => {
        refreshList();
      });
    };
    AuthService.refreshTokenWrapperFunction(serviceCall);
  };

  const findByOrderNumber = () => {
    let serviceCall = () => {
      //changed from const to let to maintain best practices
      return OrderDataService.findByOrderNumber(searchTitle).then(
        (response) => {
          if ("error" in response.data) {
            setErrorMessage(response.data.error);
          } else {
            console.log("found", response.data);
            setOrders(response.data.orders);
          }
          setLoading(false);
        }
      );
    };
    try {
      setLoading(true);
      AuthService.refreshTokenWrapperFunction(serviceCall);
    } catch (e) {
      console.log(e);
    }
  };

  const clearSearch = () => {
    refreshList();
    setSearchTitle("");
    setErrorMessage("");
  };

  const formatDate = (dateString) => {
    /*https://github.com/w3c/respec/issues/1357#issuecomment-760913749 
    and also remove the fractional seconds as was required */
    const safariFix = dateString.replace(/-/g, "/").replace(/\..*/, "");
    // console.log(dateString, safariFix, new Date(Date.parse(safariFix)))
    return dateString !== "" && dateString !== null
      ? Intl.DateTimeFormat("en-US").format(Date.parse(safariFix))
      : "";
  };

  let ordersToDisplay = [];
  sortedOrders ? (ordersToDisplay = sortedOrders) : (ordersToDisplay = orders);

  const orderTbody = (
    <div className={styles.flagContainer}>
      {loading
        ? "Loading..."
        : ordersToDisplay &&
          ordersToDisplay.map((order, index) => (
            <>
              <div
                className={styles.flagItem}
                onClick={() => setActiveOrder(order, index)}
                key={index}
              >
                <p className={styles.orderNum}>{order.order_number}</p>
                <p className={styles.officeCode}>{order.home_office_code}</p>

                <div className={styles.gaugeContainer}>
                  <Gauge
                    status={order.status.id}
                    code={order.status.status_code.replace(/_/g, " ")}
                  />
                </div>
              </div>
              <div>
                {currentOrder ? ( // checks for null value
                  currentOrder.order_number == order.order_number ? (
                    <div className={styles.mobileStatus}>
                      <div className={styles.statusItem}>
                        <p className={styles.description}>
                          {currentOrder.status.description}
                        </p>
                      </div>
                      <div className={styles.statusItem}>
                        <p>
                          <b>Created:</b> {formatDate(currentOrder.created_at)}
                        </p>
                        <p>
                          <b>Updated:</b> {formatDate(currentOrder.updated_at)}
                        </p>
                      </div>
                      <div className={styles.statusItem}>
                        <Link
                          to={"/orders/" + currentOrder.uuid}
                          className={styles.orderLinks}
                        >
                          Edit
                        </Link>
                        <Link
                          to={{
                            pathname: "/scan/" + currentOrder.uuid,
                            state: {
                              orderOfficeCheck: currentOrder.home_office_code,
                            },
                          }} // sends order office to route for checking
                          className={styles.orderLinks}
                        >
                          Scan
                        </Link>
                        <Link
                          to={"/print/" + currentOrder.uuid}
                          className={styles.orderLinks}
                        >
                          Print
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: 0 }}></div>
                  )
                ) : (
                  <div style={{ borderTop: "none" }}></div>
                )}
              </div>
            </>
          ))}
    </div>
  );

  const closePopUpBox = () => {
    setPopUpbox("none");
  };

  return (
    <>
      <div className={styles.mainContainer}>
        <h4 className={styles.title}>Orders</h4>
        <div className={styles.inputContainer}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by order number"
            value={searchTitle}
            onChange={onChangeSearchTitle}
          />
          <div className={styles.searchButton}>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByOrderNumber}
            >
              Search
            </button>
          </div>
        </div>
        <TableHeader
          sortedField={sortedField}
          sortDir={sortDir}
          setSortedField={setSortedField}
          setSortType={setSortType}
          setSortDir={setSortDir}
        />

        <div className={styles.orderContainer}>
          {orderTbody}

          <div className={styles.statusItemContainer}></div>
        </div>

        {errorMessage || searchTitle ? (
          <button className="m-3 btn btn-sm btn-danger" onClick={clearSearch}>
            Clear search
          </button>
        ) : (
          <div className={styles.statusItem}>
            <p>
              Please click
              <br /> on an order...
            </p>
          </div>
        )}
      </div>
      <div className="pop-container" style={{ display: popUpBox }}>
        <div className="pop-up" onClick={closePopUpBox}>
          <h3>{errorMessage}</h3>
        </div>
      </div>
    </>
  );
};

export default OrdersList;
