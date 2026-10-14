import './SiteFooter.css'

/** Non-affiliation notice and trademark attributions. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        <strong>Unofficial fan project.</strong> NBA Pokédex is not affiliated with, endorsed, sponsored, or approved by
        Nintendo, Game Freak, Creatures Inc., The Pokémon Company, the National Basketball Association (NBA), any NBA
        team, the NBA Players Association, or any player.
      </p>
      <p>
        Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and Game Freak. NBA and team
        names and logos are trademarks of NBA Properties, Inc. and the respective teams. All other images and marks
        belong to their respective owners.
      </p>
    </footer>
  )
}
