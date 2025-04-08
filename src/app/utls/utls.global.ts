// import { userRole } from "../constants/user";
// import User from "../modules/user/user.model";

// const findLastUser = async (userRole: string) => {
//     const lastUser = await User.findOne(
//         {
//             role: userRole,
//         },
//         {
//             id: 1,
//             _id: 0,
//         }
//     )
//         .sort({
//             createdAt: -1,
//         })
//         .lean();

//     return lastUser?.id ? lastUser.id : undefined;
// };

// export const generateSellerId = async () => {
//     const lastSellerId = await findLastUser(userRole.SELLER);
//     if (!lastSellerId) return "S-0001";

//     const lastId = parseInt(lastSellerId.split("-")[1]);
//     const currentSellerId = `S-${(lastId + 1).toString().padStart(4, "0")}`;
//     return currentSellerId;
// };

// export const generateBranchManagerId = async () => {
//     const lastBranchManagerId = await findLastUser(userRole.BRANCH_MANAGER);
//     if (!lastBranchManagerId) return "BM-0001";

//     const lastId = parseInt(lastBranchManagerId.split("-")[1]);
//     const currentBranchManagerId = `BM-${(lastId + 1).toString().padStart(4, "0")}`;
//     return currentBranchManagerId;
// }
