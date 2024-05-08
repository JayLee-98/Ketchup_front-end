import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Main from './pages/Main';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Notices from './pages/notices/Notices';
import InsertNotice from './pages/notices/InsertNotice';
import Calendar from './pages/schedules/calendar';
import Login from './pages/members/Login';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}> {/** 중첩구조 설정시 route로 layout 먼저 설정한 후 그 하위에 route를 중첩으로 만들어주면 됨 */}
          <Route index element={<Main />} />
          <Route path='main' element={<Main />} />
          <Route path='notices'>
            <Route index element={<Notices />} />
            <Route path='insert' element={<InsertNotice />} />
          </Route>
          {/* <Route path='board' element={<Boards />} /> */}
          <Route path='calendar' element={<Calendar />} />
        </Route>
        <Route path='login' element={<Login/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;