CREATE TABLE "qr_encoding_phases" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"matrix_data" json NOT NULL,
	"order" serial NOT NULL
);
