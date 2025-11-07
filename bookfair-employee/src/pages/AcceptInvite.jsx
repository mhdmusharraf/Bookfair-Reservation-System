import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Paper, TextField, Button, Typography } from "@mui/material";
import { validateInvite, acceptInvite } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function AcceptInvite() {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { login } = useAuth();

  useEffect(()=> {
    (async ()=>{
      try {
        const { data } = await validateInvite(token);
        setInfo(data);
      } catch {
        setErr("Invite link invalid or expired");
      }
    })();
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await acceptInvite(token, { password });
      login(data.token, data.user);
      nav("/");
    } catch {
      setErr("Failed to accept invite");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Paper className="p-6 w-full max-w-md">
        <Typography variant="h5" className="font-bold mb-3">Accept Employee Invite</Typography>
        {info && (
          <Typography variant="body2" className="mb-3">
            Vendor: <b>{info.vendorBusiness}</b> — Employee email: <b>{info.email}</b>
          </Typography>
        )}
        <form onSubmit={onSubmit} className="space-y-3">
          <TextField fullWidth type="password" label="Set password" value={password} onChange={e=>setPassword(e.target.value)}/>
          {err && <Typography color="error" variant="body2">{err}</Typography>}
          <Button type="submit" variant="contained">Accept & Continue</Button>
        </form>
      </Paper>
    </div>
  );
}
