import { AboutDialog } from './AboutDialog'
import './SiteFooter.css'

/** About button and the non-affiliation notice. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <AboutDialog />
      <p>
        <strong>Unofficial fan project.</strong> NBA Pokédex is not affiliated with Nintendo, Game Freak, Creatures Inc.,
        The Pokémon Company, the National Basketball Association, or any NBA team.
      </p>
    </footer>
  )
}
