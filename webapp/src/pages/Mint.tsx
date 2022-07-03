import React, { FC, useState } from "react";
import { MainLayout } from "../layouts/MainLayout";
import plantPhotoSrc from "../assets/img/plant-photo.png";
import {
  CameraIcon,
  LocationMarkerIcon,
  MapIcon,
  UploadIcon,
} from "@heroicons/react/outline";
import { useForm } from "react-hook-form";
import { uploadWeb3Files } from "../lib/uploadFile";
import classNames from "classnames";
import { renameFile } from "../utils/file";
import { uriToGatewayUrl } from "../utils/web3storage";
import { LocationPicker } from "../components/LocationPicker";

export interface MintProps {}

interface FormValues {
  imageUri: string;
  name: string;
  treeSpecies: string;
  location: {
    lat: number;
    lng: number;
  };
}

type Step = "PHOTO" | "DETAILS" | "MINT";

const STEPS: Step[] = ["PHOTO", "DETAILS", "MINT"];

export const Mint: FC<MintProps> = (props) => {
  const [step, setStep] = useState<Step>("PHOTO");
  const [loading, setLoading] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File>();
  const [locationPickerOpen, setLocationPickerOpen] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      location: {},
    },
  });
  const onSubmit = (data: FormValues) => {
    console.log(data);
    if (step !== "DETAILS") {
      return;
    }
  };
  const renderProgress = () => {
    const currentIdx = STEPS.findIndex((s) => s === step);
    const getClassName = (idx: number) =>
      currentIdx < idx ? "step" : "step step-primary";
    return (
      <ul className="steps w-full">
        {["Plant", "Details", "Mint"].map((label, idx) => (
          <li className={getClassName(idx)}>{label}</li>
        ))}
      </ul>
    );
  };
  const values = getValues();

  const onImageFileChange = async (e: React.FormEvent<HTMLInputElement>) => {
    setLoading(true);
    const target = e.target as HTMLInputElement;
    const file = renameFile(target.files![0], "image");
    const [web3File] = await uploadWeb3Files([file]);
    setLoading(false);
    const uri = `ipfs://${web3File.cid}`;
    setValue("imageUri", `ipfs://${web3File.cid}`);
  };
  const uploadBtnClasses = classNames("btn btn-outline btn-primary w-full", {
    loading,
  });
  const onLocationChange = (lat: number, lng: number) => {
    setValue("location.lat", lat);
    setValue("location.lng", lng);
  };
  const disableSubmit =
    !values.imageUri ||
    !values.name ||
    !values.treeSpecies ||
    !values.location.lat ||
    !values.location.lng;
  return (
    <MainLayout>
      <LocationPicker
        open={locationPickerOpen}
        setOpen={setLocationPickerOpen}
        onChange={onLocationChange}
      />
      <div className="card bg-base-100 shadow-md max-w-lg mx-auto mt-12">
        <div className="p-8 border-b">{renderProgress()}</div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === "PHOTO" && (
              <>
                <div className="p-8 w-full">
                  <div className="w-full text-center">
                    <div className="flex-col items-center justify-center">
                      {values.imageUri ? (
                        <div>
                          <img
                            alt="Upload Preview"
                            className="w-full h-80 object-cover mb-4"
                            src={uriToGatewayUrl(values.imageUri)}
                          />
                        </div>
                      ) : (
                        <>
                          <h2 className="text-center text-2xl mb-4 text-primary font-bold">
                            Plant your Tree
                          </h2>
                          <img
                            alt="Take a picture of your plant"
                            src={plantPhotoSrc}
                            className="w-[128px] block mx-auto mb-4"
                          />
                          <p className="text-base-content text-opacity-70 mb-4">
                            Plant a tree and take a picture for this amazing
                            moment
                          </p>
                        </>
                      )}
                      <div>
                        <label
                          className={uploadBtnClasses}
                          htmlFor="take_picture"
                        >
                          {loading ? (
                            <span>Uploading...</span>
                          ) : (
                            <>
                              <CameraIcon className="h-4 w-4 mr-2" />
                              {values.imageUri
                                ? "Take Another Picture"
                                : "Take Picture"}
                            </>
                          )}
                        </label>
                        <input
                          className="hidden"
                          id="take_picture"
                          type="file"
                          onChange={onImageFileChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t p-4 text-right">
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep("DETAILS")}
                    disabled={!values.imageUri}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
            {step === "DETAILS" && (
              <div className="w-full">
                <div className="p-8">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">
                        Give a name for this tree
                      </span>
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: true, minLength: 2 })}
                      className="input input-bordered w-full"
                    />
                    <label className="label">
                      {errors && errors.name && (
                        <span className="label-text-alt text-error-content">
                          Please, insert a valid name
                        </span>
                      )}
                    </label>
                  </div>
                  <div className="form-control w-full mt-4">
                    <label className="label">
                      <span className="label-text">
                        What is the Tree species?
                      </span>
                    </label>
                    <input
                      type="text"
                      {...register("treeSpecies", { required: false })}
                      className="input input-bordered w-full"
                    />
                    <label className="label">
                      {errors && errors.treeSpecies && (
                        <span className="label-text-alt text-error-content">
                          {errors.treeSpecies.message}
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="form-control w-full mt-4">
                    <label className="label">
                      <span className="label-text">
                        Where the tree was planted?
                      </span>
                    </label>
                    <button
                      className="btn btn-outline btn-primary"
                      onClick={() => setLocationPickerOpen(true)}
                    >
                      <LocationMarkerIcon className="w-5 h-5 mr-2" />
                      Pick Location
                    </button>
                  </div>
                </div>
                <div className="border-t p-4 flex justify-between">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setStep("PHOTO")}
                    disabled={!values.imageUri}
                  >
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={disableSubmit}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  );
};
