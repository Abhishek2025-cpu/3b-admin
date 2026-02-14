import React from 'react'; // React import karna zaroori hai
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Sabhi Components ke Imports (Kuch bhi miss nahi kiya gaya hai)
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
import CompanyDetails from './compoents/CompanyDetails'; 
import SubAdmins from './compoents/SubAdmins'; 
import FeedbackAdmin from './compoents/FeedbackAdmin';
import ReturnOrder from './compoents/ReturnOrder';
import Billings from './compoents/Billings';
import GetBills from './compoents/GetBills';
import PushNotification from './compoents/PushNotification';
import DimensionsTable from './compoents/DimensionsTable';
import MachineManager from './compoents/MachineManager';
import AssignMachines from './compoents/AssignMachines';
import ArchivedClients from './compoents/ArchivedClients';
import OperatorTable from './compoents/OpreatorTable';
import InventoryStock from './compoents/InventoryStock';
import ViewInventoryLog from './compoents/ViewInventoryLog'; 
import ScanQrPage from './ScanQrPage';
import Settings from './compoents/Settings';


const ProtectedRoute = () => {
  const token = localStorage.getItem('token'); 
  
  
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
         
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />

       
          <Route element={<ProtectedRoute />}>
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="add-machine" element={<MachineManager />} />
              <Route path="assign-machines" element={<AssignMachines />} />
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
              <Route path="order-returns" element={<ReturnOrder />} />
              <Route path="billing" element={<Billings />} />
              <Route path="get-bills" element={<GetBills />} />
              <Route path="notifications" element={<PushNotification />} />
              <Route path="product-dimensions" element={<DimensionsTable />} />
              <Route path="archive-clients" element={<ArchivedClients />} />
              <Route path="operators" element={<OperatorTable />} />
              <Route path="inventory-stock" element={<InventoryStock />} />
              <Route path="/manager/inventory-log" element={<ViewInventoryLog />} />
               <Route path="scan-qr" element={<ScanQrPage />} /> 
                <Route path="settings" element={<Settings />} /> 
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </BrowserRouter>

      <div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </>
  );
}

export default App;