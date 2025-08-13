

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './compoents/LoginPage'; 
import ManagerLayout from './compoents/ManagerLayout';
import Dashboard from './compoents/Dashboard'; 
import AddItem from './compoents/AddItem';
import ViewItems from './compoents/ViewItems';
import ViewClients from './compoents/ViewClients';
import Chat from './compoents/Chat';
import AddStaffForm from './compoents/AddStaffForm';
import ManageStaff from './compoents/ManageStaff';
import UserOrders from './UserOrders';
import AddProductForm from './compoents/AddProductForm';
import ViewProducts from './compoents/ViewProducts';
import AddCategoryForm from './compoents/AddCategoryForm';
import Categories from './compoents/Categories';
import ManageOtherCategories from './compoents/ManageOtherCategories';
import ManageOtherProducts from './compoents/ManageOtherProducts';
import CompanyDetails from './compoents/CompanyDetails'; //np error
import SubAdmins from './compoents/SubAdmins'; 
import FeedbackAdmin from './compoents/FeedbackAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add-item" element={<AddItem />} />
          <Route path="view-items" element={<ViewItems />} />
          <Route path="view-clients" element={<ViewClients />} />
          <Route path="chats" element={<Chat />} />
       
          <Route path="chats/:userId" element={<Chat />} />       
          <Route path="add-staff" element={<AddStaffForm />} />
          <Route path="manage-staff" element={<ManageStaff />} />
          <Route path="Orders" element={<UserOrders />} />
          <Route path="add-product" element={<AddProductForm />} />
          <Route path="view-products" element={<ViewProducts />} /> 

          <Route path='add-category' element={<AddCategoryForm/>}/>
          <Route path='view-categories' element= {<Categories/>}/>
          <Route path ='Other-Categories' element ={<ManageOtherCategories/>}/>
          <Route path = 'other-products' element ={<ManageOtherProducts/>}/>
          <Route path="company" element={<CompanyDetails />} />
          <Route path="admins" element={<SubAdmins />} />
          <Route path="Feedback" element={<FeedbackAdmin />} />
          
          {/* Add routes for 'add-staff', 'view-clients', etc. as you create them */}
        </Route>
        
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;