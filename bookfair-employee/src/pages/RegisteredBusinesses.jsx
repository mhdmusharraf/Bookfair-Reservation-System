import React, { useState } from 'react'
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import dummyRequests from '../data/dummyRequests';
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from '@mui/material';



const RegisteredBusinesses = () => {
const [businesses, setBusinesses] = useState(dummyRequests);

   const deleteBusiness = (id) => {
     setBusinesses((prev) => prev.filter((b) => b.id !== id));
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
              Stalls - Genre
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
              <TableCell align="center">
                {business.requestedStalls.map((s) => (
                  <div key={s.stallId}>{`${s.stallId} - ${s.genre}`}</div>
                ))}
              </TableCell>
              <TableCell align="center">
                {" "}
                <IconButton onClick={() => deleteBusiness(business.id)}>
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

export default RegisteredBusinesses