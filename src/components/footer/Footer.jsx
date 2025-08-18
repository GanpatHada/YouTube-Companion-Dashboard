import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer>
     <ul>
        <li><Link to={"/privacy-policy"}>Privacy policy</Link></li>
        <li><Link to={"/terms-and-conditions"}>Terms and conditions</Link></li>
     </ul>
    </footer>
  )
}

export default Footer
