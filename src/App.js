import { useEffect, useState, useRef } from "react";
import { Route, Switch, Link } from "react-router-dom";
import classes from "./App.module.css";

function App() {
  const [bankName, setBankName] = useState();
  const [interest, setInterest] = useState();
  const [maximumLoan, setMaximumLoan] = useState();
  const [minimumPayment, setMinimumPayment] = useState();
  const [loanTerm, setLoanTerm] = useState();
  const [banks, setBanks] = useState([]);
  const [bankEdit, setBankEdit] = useState([]);
  const [render, setRender] = useState(0);
  const [inputIsCorrect, setInputIsCorrect] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const interestRef = useRef();
  const maximumLoanRef = useRef();
  const minimumPaymentRef = useRef();
  const loanTermRef = useRef();
  const paymentRef = useRef();

  const inputValue = useRef();

  const banksList = [];
  const bankNameHandler = (e) => {
    setBankName(e.target.value);
  };
  const interestHandler = (e) => {
    setInterest(e.target.value);
  };
  const maximumLoanHandler = (e) => {
    setMaximumLoan(e.target.value);
  };
  const minimumPaymentHandler = (e) => {
    setMinimumPayment(e.target.value);
  };
  const loanTermHandler = (e) => {
    setLoanTerm(e.target.value);
  };

  useEffect(() => {
    fetch("https://banks-app-2-default-rtdb.firebaseio.com/banks.json")
      .then((res) => res.json())
      .then((data) => {
        for (let i of Object.keys(data)) {
          data[i].bank.url = i;
          banksList.push(data[i].bank);
        }
        setBanks(banksList);
      });
  }, []);

  const editHandler = (bank) => {
    setIsEdit(true);
    setBankEdit([bank]);
  };

  const editCorrectHandler = (bank) => {
    setIsEdit(false);

    bank.interest = interestRef.current.value;
    bank.maximumLoan = maximumLoanRef.current.value;
    bank.minimumPayment = minimumPaymentRef.current.value;
    bank.loanTerm = loanTermRef.current.value;

    console.log(bank);
    const editBank = [
      {
        id: bank.id,
        bankName: bank.bankName,
        interest: interestRef.current.value,
        maximumLoan: maximumLoanRef.current.value,
        minimumPayment: minimumPaymentRef.current.value,
        loanTerm: loanTermRef.current.value,
        url: bank.url,
      },
    ];

    console.log();
    fetch(
      `https://banks-app-2-default-rtdb.firebaseio.com/banks/${bank.url}.json`,
      {
        method: "PUT",
        headers: {
          "Content-type": "aplication/json",
        },
        body: JSON.stringify({ bank: editBank[0] }),
      }
    );

    setBankEdit(editBank);
  };

  const bank = {
    id: `${bankName}${Math.random().toFixed(3)}`,
    bankName: bankName,
    interest: interest,
    maximumLoan: maximumLoan,
    minimumPayment: minimumPayment,
    loanTerm: loanTerm,
  };

  console.log(banks);
  const submithandler = () => {
    if (bankName && interest && maximumLoan && minimumPayment && loanTerm) {
      fetch("https://banks-app-2-default-rtdb.firebaseio.com/banks.json", {
        method: "POST",
        body: JSON.stringify({ bank }),
      });

      const banksUpdate = [...banks, bank];
      setBanks(banksUpdate);
    } else {
      alert("Not correct input");
    }
  };

  const mortgageHandler = (bank) => {
    if (+bank.maximumLoan >= +inputValue.current.value) {
      setInputIsCorrect(true);
    } else {
      setInputIsCorrect(false);
    }
    setRender(!render);
  };

  const deleteHandler = (bank) => {
    const bankRemove = [];
    banks.map((ban) => {
      if (ban.id !== bank.id) {
        bankRemove.push(ban);
      }
      if (ban.id === bank.id) {
        fetch(
          `https://banks-app-2-default-rtdb.firebaseio.com/banks/${ban.url}.json`,
          {
            method: "DELETE",
            headers: {
              "Content-type": "aplication/json",
            },
          }
        );
      }
    });
    setBanks(bankRemove);
  };

  const calculatemortgage = (bank) => {
    let mortgage = inputValue.current.value;
    let monthyPaymnet;
    const checkIsCorrect =
      monthyPaymnet &&
      (+mortgage * +bank.minimumPayment) / 100 < +paymentRef.current.value;
    if (paymentRef.current.value) {
      if (
        (+mortgage * +bank.minimumPayment) / 100 <
        +paymentRef.current.value
      ) {
        console.log(bank.minimumPayment);
        let mortgagePayment =
          +inputValue.current.value - +paymentRef.current.value;
        monthyPaymnet =
          (mortgagePayment *
            (bank.interest / 1200) *
            Math.pow(1 + bank.interest / 1200, bank.loanTerm)) /
          (Math.pow(1 + bank.interest / 1200, bank.loanTerm) - 1);
      }
    }
    if (
      (+mortgage * +bank.minimumPayment) / 100 < +paymentRef.current.value &&
      +paymentRef.current.value < +mortgage
    ) {
      return (
        monthyPaymnet && (
          <div>
            <h3>your mortgage: {mortgage}</h3>
            <h3>monthy payment: {monthyPaymnet.toFixed(2)}</h3>
            <h3>Down payment: {paymentRef.current.value}</h3>
          </div>
        )
      );
    } else {
      return <div></div>;
    }
  };

  console.log(bankEdit);
  return (
    <div className={classes.banks}>
      <Switch>
        <Route path="/" exact>
          <div className={classes.button}>
            <Link to="/add">
              <button>Add bank</button>
            </Link>
          </div>
          {!isEdit
            ? banks.map((bank) => {
                const bankLink = `/${bank.id}`;
                return (
                  <div className={classes.bank} key={classes.id}>
                    <h3>{bank.bankName}</h3>
                    <div className={classes.text}>
                      <p>Interest rate: {bank.interest}%</p>
                      <p>Maximum loan: {bank.maximumLoan}$</p>
                      <p>
                        Minimum payment:
                        {bank.minimumPayment}%
                      </p>
                      <p>Loan term: {bank.loanTerm} months</p>
                    </div>
                    <Link to={bankLink}>
                      <button>add mortgage</button>
                    </Link>
                    <button
                      onClick={() => {
                        deleteHandler(bank);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        editHandler(bank);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                );
              })
            : bankEdit.map((bank) => {
                return (
                  <div className={classes.bank} key={bank.id}>
                    <h3>{bank.bankName}</h3>
                    <div className={classes.text}>
                      <input defaultValue={bank.interest} ref={interestRef} />
                      <input
                        defaultValue={bank.maximumLoan}
                        ref={maximumLoanRef}
                      />
                      <input
                        defaultValue={bank.minimumPayment}
                        ref={minimumPaymentRef}
                      />
                      <input defaultValue={bank.loanTerm} ref={loanTermRef} />
                    </div>
                    <button
                      onClick={() => {
                        editCorrectHandler(bank);
                      }}
                    >
                      Submit Edit
                    </button>
                  </div>
                );
              })}
        </Route>
        <Route path="/add">
          <div className={classes.button}>
            <Link to="/">
              <button>Back</button>
            </Link>
          </div>
          <div className={classes.input}>
            <input
              placeholder="bank name"
              onChange={bankNameHandler}
              type="string"
            />
            <input
              placeholder="Interest rate (%)"
              onChange={interestHandler}
              type="number"
            />
            <input
              placeholder="Maximum loan ($)"
              onChange={maximumLoanHandler}
              type="number"
            />
            <input
              placeholder="Minimum payment (%)"
              onChange={minimumPaymentHandler}
              type="number"
            />
            <input
              placeholder="Loan term (months)"
              onChange={loanTermHandler}
              type="number"
            />
            {bankName &&
            interest &&
            maximumLoan &&
            minimumPayment &&
            loanTerm ? (
              <Link to="">
                <button onClick={submithandler}>Submit</button>
              </Link>
            ) : (
              <button onClick={submithandler}>Submit</button>
            )}
          </div>
        </Route>
        {banks.map((bank) => {
          const bankLink = `/${bank.id}`;
          return (
            <Route path={bankLink}>
              <div className={classes.bank} key={classes.id}>
                <h3>{bank.bankName}</h3>
                <div className={classes.text}>
                  <p>Interest rate: {bank.interest}%</p>
                  <p>Maximum loan: {bank.maximumLoan}$</p>
                  <p>
                    Minimum payment:
                    {bank.minimumPayment}%
                  </p>
                  <p>Loan term: {bank.loanTerm} months</p>
                </div>
              </div>
              <input
                onChange={() => {
                  mortgageHandler(bank);
                }}
                ref={inputValue}
                type="number"
                placeholder="Entred your mortage"
              />
              <input
                onChange={() => {
                  mortgageHandler(bank);
                }}
                style={{ marginLeft: 40 }}
                ref={paymentRef}
                type="number"
                placeholder="Entred your payment"
              ></input>
              <p>Down payment must be bigger than 20 percent of mortgage</p>
              {inputIsCorrect && calculatemortgage(bank)}
              <Link to="/">
                <button>Back</button>
              </Link>
            </Route>
          );
        })}
      </Switch>
    </div>
  );
}

export default App;
