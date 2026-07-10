import mongoose, {
  Schema,
  Document,
  Types,
  model,
} from "mongoose";

/* ----------------------------------------
   Gallery Item
-----------------------------------------*/
export interface IGalleryItem extends Types.Subdocument {
  title: string;
  description: string;
  canvaLink: string;
  thumbnail: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ----------------------------------------
   Gallery Content
-----------------------------------------*/
export interface IGalleryContent extends Document {
  magazines: Types.DocumentArray<IGalleryItem>;
  brochures: Types.DocumentArray<IGalleryItem>;
  posters: Types.DocumentArray<IGalleryItem>;
  createdAt: Date;
  updatedAt: Date;
}

/* ----------------------------------------
   Item Schema
-----------------------------------------*/
const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    canvaLink: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

/* ----------------------------------------
   Content Schema
-----------------------------------------*/
const GalleryContentSchema = new Schema<IGalleryContent>(
  {
    magazines: {
      type: [GalleryItemSchema],
      default: [],
    },
    brochures: {
      type: [GalleryItemSchema],
      default: [],
    },
    posters: {
      type: [GalleryItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const GalleryContent = model<IGalleryContent>(
  "GalleryContent",
  GalleryContentSchema
);

export default GalleryContent;