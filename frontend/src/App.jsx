import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layouts/Layout";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import RequestActivationPage from "./pages/auth/RequestActivation";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ResetPasswordRequestPage from "./pages/auth/ResetPasswordRequest";
import ProtectedRoute from "./ProtectedRoute";




// ✅ Protected Pages 
import NewCommunity from "./pages/community/NewCommunity";
import Search from "./pages/GlobalSearch";
import Community from "./pages/community/Community";
import BatchCreateItems from "./pages/BatchCreate";
import ItemDetails from "./pages/item/ItemDetails";
import User from "./pages/user/User";
import CreateUser from "./pages/user/CreateUser";
import Cart from "./pages/cart/Cart";
import Metadata from "./pages/metadata/Metadata";
import Collection from "./pages/collection/Collection";
import CollectionDetails from "./pages/collection/CollectionDetails";
import NewCollection from "./pages/collection/NewCollection";
import CartManagement from "./pages/cart/CartManagement";
import Request from "./pages/cart/Request";
import Accept from "./pages/cart/Accept";
import Reject from "./pages/cart/Reject";
import Resolved from "./pages/cart/Resolved";
import Rejected from "./pages/cart/Rejected";
import NewItem from "./pages/item/newItem";
import EditItem from "./pages/item/EditItem";
import EditCommunity from "./pages/community/EditCommunity";
import EditCollection from "./pages/collection/EditCollection";
import EditUser from "./pages/user/EditUser";
import Groups from "./pages/group/Groups";
import CreateGroup from "./pages/group/CreateGroup";
import EditGroup from "./pages/group/EditGroup";
import CommunityList from "./pages/community/CommunityList";
import Reprosetory from "./pages/community/Reprosetory";
import MetadataRegistry from "./pages/metadata/MetadataRegistry";
import MetadataSchema from "./pages/metadata/MetadataSchema";
import Notification from "./pages/cart/Notification";
import SearchEditUser from "./pages/user/SearchEditUser";
import ActivityLog from "./pages/ActivityLog";
import UserRequest from "./pages/cart/UserRequest";
import ArchivedUser from "./pages/user/ArchivedUsers";
import ArchivedCollection from "./pages/collection/ArchivedCollections";
import ArchivedCommunity from "./pages/community/ArchivedCommunities";
import ArchivedItem from "./pages/item/ArchivedItems";
import CarouselAdminPage from "./pages/CarouselPanel";
import MappingPage from "./pages/MappingPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* ✅ Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/request-activation" element={<RequestActivationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/request-reset-password" element={<ResetPasswordRequestPage />} />



          
          {/* ✅ Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/newCommunity" element={<NewCommunity />} />
            <Route path="/search" element={<Search />} />
            <Route path="/community" element={<Community />} />
            <Route path="/item-batch" element={<BatchCreateItems />} />
            <Route path="/item/:itemId" element={<ItemDetails />} />
            <Route path="/user" element={<User />} />
            <Route path="/createUser" element={<CreateUser />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/metadata" element={<Metadata />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/collectionDetails" element={<CollectionDetails />} />
            <Route path="/newCollection" element={<NewCollection />} />
            <Route path="/cartManagement" element={<CartManagement />} />
            <Route path="/request/:orderId" element={<Request />} />
            <Route path="/accept" element={<Accept />} />
            <Route path="/reject" element={<Reject />} />
            <Route path="/resolved" element={<Resolved />} />
            <Route path="/rejected" element={<Rejected />} />
            <Route path="/newItem" element={<NewItem />} />
            <Route path="/editItem" element={<EditItem />} />
            <Route path="/editCommunity" element={<EditCommunity />} />
            <Route path="/editCollection" element={<EditCollection />} />
            <Route path="/editUser/:userId" element={<EditUser />} />
            <Route path="/searchEditUser" element={<SearchEditUser />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/createGroup" element={<CreateGroup />} />
            <Route path="/editGroup/:groupId" element={<EditGroup />} />
            <Route path="/communityList" element={<CommunityList />} />
            <Route path="/reprosetory" element={<Reprosetory />} />
            <Route path="/metadataRegistry" element={<MetadataRegistry />} />
            <Route path="/metadataSchema/:schemaId" element={<MetadataSchema />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/activityLog" element={<ActivityLog />} />
            <Route path="/userRequest" element={<UserRequest />} />
            <Route path="/archivedUsers" element={<ArchivedUser />} />
            <Route path="/archivedItems" element={<ArchivedItem />} />
            <Route path="/archivedCollections" element={<ArchivedCollection />} />
            <Route path="/archivedCommunities" element={<ArchivedCommunity />} />
            <Route path="/carousel-panel" element={<CarouselAdminPage />} />
            <Route path="/mapping" element={<MappingPage />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
