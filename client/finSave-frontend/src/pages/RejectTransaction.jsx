import { useParams } from "react-router-dom";
import API from "../api/axios";
import { useEffect } from "react";

const RejectTransaction = () => {
  const { txnId } = useParams();

  useEffect(() => {
    API.post(`/fraud/reject/${txnId}`, {}, { withCredentials: true })
      .then(() => alert("❌ Transaction rejected."))
      .catch(() => alert("⚠️ Failed to reject transaction."));
  }, [txnId]);

  return <p>Processing rejection...</p>;
};

export default RejectTransaction;
