import axiosInstance from "../../services/axiosInstance"

export const userLoginApi = async(data)=>{
    try{
        const res = await axiosInstance.post("v1/auth/student/login",data);
        return res.data.data; 
    }
    catch(error){
        throw{
            message:error?.response?.data?.message || error.message|| 'Login Failed'
        }
    }
};



export const registerApi = async (data) => {
  try {
    const res = await axiosInstance.post("v1/auth/student/register", data);
  console.log("res api ",res)
    return res.data.data;
  } catch (error) {
        throw{
            message:error?.response?.data?.message || error.message || 'Resistration failed',
        }

  }
};