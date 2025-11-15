import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { registerApi, userLoginApi } from "../apis/authApi";

export const loginUserAsync = createAsyncThunk("auth/userLogin",async(data,{rejectWithValue})=>{
    try{
     let res = await userLoginApi(data)
     return res
    }catch(error){
     return rejectWithValue(error.message)
    }
})

export const registerUserAsync = createAsyncThunk(
  "auth/registerUser", async (data, { rejectWithValue }) => {
    try {
      let res = await registerApi(data);
      return res;
    } catch(error) {
     return rejectWithValue( error.message);
    }
  }
);


const initialState = {
    user:[],
    isLoading:true,
    error:null
}
export const authSlice = createSlice({
    name :'auth',
    initialState,
    reducers:{

    },
    extraReducers:(builder)=>{
        builder.addCase(loginUserAsync.pending,(state,action)=>{
            state.user = null;
            state.isLoading = true;
            state.error = false
        })
        .addCase(loginUserAsync.rejected,(state,action)=>{
            state.user = null;
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(loginUserAsync.fulfilled,(state,action)=>{
            state.user = action.payload;
            state.isLoading = false;
            state.error = false
        })


    .addCase(registerUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error =null;
      })
      .addCase(registerUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error =null;
        state.user = action.payload;
      })
      .addCase(registerUserAsync.rejected, (state,action) => {
        state.isLoading = false;
        state.error =action.payload;
        state.user = null;
      });

 
    }

})

export default authSlice.reducer