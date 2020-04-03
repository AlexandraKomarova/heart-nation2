import React from 'react'
import { Link } from "react-router-dom"
import { connect } from "react-redux"
import PropTypes from 'prop-types'
import { logout } from "../../actions/auth"

const Navbar = ({ auth: { isAuthenticated, loading }, logout }) => {
  const authLinks = (
    <ul>
      <li>
        <Link to="/dashboard">
          <i className="fas fa-user"></i>{" "}
          <span className="hide-sm">Dashboard</span>
        </Link>
      </li>
      <li><a onClick={logout}href="#!">
        <i className="fas fa-sign-out-alt"></i>{" "}
        <span className="hide-sm">Logout</span>
        </a>
      </li>
    </ul>
  )

  const guestLinks = (
    <ul>
      <li><Link to="/register">Register</Link></li>
      <li><Link to="/login">Login</Link></li>
    </ul>
  )

  return <>
    <nav className="navbar">
        <h1>
          <Link to="/"><i class="far fa-heart"></i> Heart Nation</Link>
        </h1>
        { !loading && (<>{ isAuthenticated ? authLinks :  guestLinks }</>) }
      </nav>
    </>
}

Navbar.propTypes = {
  auth: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(mapStateToProps, { logout })(Navbar)
