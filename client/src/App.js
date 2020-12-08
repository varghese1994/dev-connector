import React,{Fragment} from 'react'
import {BrowserRouter as Router,Route,Switch} from 'react-router-dom'
import './App.css';

//componets
import Navbar from './components/layouts/Navbar';
import Landing from './components/layouts/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Alert from './components/layouts/Alert';
//redux
import {Provider} from 'react-redux';
import store from './store'

const App = () => { 
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar/>
          <Route exact path="/" component={Landing}/>
          <section className="container">
            <Alert/>
            <Switch>
              <Route exact path="/register" component={Register}/>
              <Route exact path="/login" component={Login}/>
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
    
  );
}

export default App;