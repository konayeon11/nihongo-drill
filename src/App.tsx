import { useRoute } from './router'
import { AppProvider, useApp } from './state/AppContext'
import { TabBar } from './components/TabBar'
import { Home } from './screens/Home'
import { Study } from './screens/Study'
import { Result } from './screens/Result'
import { Browse } from './screens/Browse'
import { Detail } from './screens/Detail'
import { Stats } from './screens/Stats'
import { Settings } from './screens/Settings'
import { CourseScreen } from './screens/CourseScreen'
import { UnitScreen } from './screens/UnitScreen'

const FULLSCREEN = ['study', 'result']

function Routes() {
  const { ready } = useApp()
  const { pathname, segments, query } = useRoute()
  const root = segments[0] ?? ''

  if (!ready) {
    return (
      <div className="screen screen--boot">
        <p className="boot">日本語</p>
      </div>
    )
  }

  let view
  switch (root) {
    case '':
      view = <Home />
      break
    case 'study':
      view = <Study deck={query.get('deck') ?? undefined} unitId={query.get('unit') ?? undefined} />
      break
    case 'result':
      view = <Result />
      break
    case 'browse':
      view = <Browse />
      break
    case 'item':
      view = <Detail id={segments[1] ?? ''} />
      break
    case 'course':
      view = <CourseScreen id={segments[1] ?? ''} />
      break
    case 'unit':
      view = <UnitScreen id={segments[1] ?? ''} />
      break
    case 'stats':
      view = <Stats />
      break
    case 'settings':
      view = <Settings />
      break
    default:
      view = <Home />
  }

  const showTabs = !FULLSCREEN.includes(root)

  return (
    <div className={showTabs ? 'app has-tabs' : 'app'}>
      {view}
      {showTabs && <TabBar path={pathname} />}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  )
}
