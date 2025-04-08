import { Router } from "express";
import checkAuth from "../../middleWares/checkAuth";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./review.controller";
import validateRequest from "../../middleWares/validateRequest";
import { reviewValidation } from "./review.validation";

const router = Router();

router.post(
    "/",
    checkAuth(UserRole.PATIENT),
    validateRequest(reviewValidation.reviewZodSchema),
    ReviewController.upsertReview
);

router.get("/", ReviewController.getReviews);


export const ReviewRoutes = router;
