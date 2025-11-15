import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import dummyRequests from "../data/dummyRequests";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { acceptUser, rejectUser } from "../api/auth.js";



const JoinRequests = () => {
 const [businesses, setBusinesses] = useState(dummyRequests);

 const deleteBusiness = async (id, email, userId) => {
   await rejectUser(userId, email);
   setBusinesses((prev) => prev.filter((b) => b.id !== id));
 };

  const AcceptBusiness = async (id, email, userId) => {
    try {
      await acceptUser(userId, email);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Error accepting:", err);
    }
  };



 return (
   <TableContainer component={Paper}>
     <Table sx={{ minWidth: 650 }} aria-label="simple table">
       <TableHead>
         <TableRow>
           <TableCell sx={{ fontWeight: "bold" }}>Business Name</TableCell>
           <TableCell sx={{ fontWeight: "bold" }} align="left">
             Email
           </TableCell>
           <TableCell sx={{ fontWeight: "bold" }} align="left">
             Phone Number
           </TableCell>
           <TableCell sx={{ fontWeight: "bold" }} align="center">
             Actions
           </TableCell>
         </TableRow>
       </TableHead>
       <TableBody>
         {businesses.map((business) => (
           <TableRow
             key={business.id}
             sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
           >
             <TableCell component="th" scope="row">
               {business.businessName}
             </TableCell>
             <TableCell align="left">{business.email}</TableCell>
             <TableCell align="left">{business.phoneNumber}</TableCell>

             <TableCell
               align="center"
               sx={{ display: "flex", justifyContent: "center", gap: 4 }}
             >
               <IconButton
                 onClick={() =>
                   AcceptBusiness(business.id, business.email, business.userId)
                 }
               >
                 <CheckIcon />
               </IconButton>

               <IconButton
                 onClick={() =>
                   deleteBusiness(business.id, business.email, business.userId)
                 }
               >
                 <DeleteIcon />
               </IconButton>
             </TableCell>
           </TableRow>
         ))}
       </TableBody>
     </Table>
   </TableContainer>
 );
}

export default JoinRequests