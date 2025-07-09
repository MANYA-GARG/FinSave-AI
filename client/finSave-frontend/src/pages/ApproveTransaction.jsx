import { useParams } from "react-router-dom";
import API from "../api/axios";
import { useEffect } from "react";

const ApproveTransaction = () => {
  const { txnId } = useParams();

  useEffect(() => {
    API.post(`/fraud/approve/${txnId}`, {}, { withCredentials: true })
      .then(() => alert("✅ Transaction approved!"))
      .catch(() => alert("❌ Failed to approve transaction."));
  }, [txnId]);

  return <p>Processing approval...</p>;
};

export default ApproveTransaction;
