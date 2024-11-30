import "./Navbar.css"

const Navbar = () => {
  return (
    <div className="navbar-container">
      <nav>
        <div className="logo">
          <img src="https://website.cdn.speechify.com/speechify-logo-v2.svg?quality=80&width=256" alt="logo"/>
        </div>
        <div className="nav-btn">
          <button>Try For Free</button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
