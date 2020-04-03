import React from 'react'
import { Link } from "react-router-dom"

export const Landing = () => {
  return <>
    <section className="landing">
        <div className="dark-overlay">
          <div className="landing-inner">
            <h1 className="x-large">Join the community</h1>
            <p className="lead">
               Create a profile, share your experince, find help with what you need and help others
            </p>
            <div className="buttons">
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
              <Link to="/login" className="btn btn-light">Login</Link>
            </div>
          </div>
        </div>
      </section>
    </>
}
