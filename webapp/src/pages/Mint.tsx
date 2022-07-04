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
import { uploadWeb3Files, uploadWeb3Json } from "../lib/uploadFile";
import classNames from "classnames";
import { renameFile } from "../utils/file";
import { LocationPicker } from "../components/LocationPicker";
import { Country, reverseGeocode } from "../utils/gmaps";
import { uriToGatewayUrl } from "../utils/web3storage";
import { MyTransactionSummary } from "react-web3-daisyui/dist/eth";
import { useWeb3 } from "../hooks/useWeb3";
import { getShortString } from "../utils/string";
import { CryptoAmount } from "react-web3-daisyui";

export interface MintProps {}

interface FormValues {
  image: string;
  name: string;
  treeSpecies: string;
  location: {
    country: {
      name: string;
      code: string;
    };
    lat: number;
    lng: number;
  };
}

type Step = "PHOTO" | "DETAILS" | "MINT";

const STEPS: Step[] = ["PHOTO", "DETAILS", "MINT"];

export const Mint: FC<MintProps> = () => {
  const [step, setStep] = useState<Step>("PHOTO");
  const [loading, setLoading] = useState<boolean>(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      location: {},
    },
  });
  const { accountAddress, chainId } = useWeb3();
  const onSubmit = async (data: FormValues) => {
    if (!data.location.country) {
      return
    }
    if (step !== "DETAILS") {
      return;
    }
    setIsSubmitting(true)
    const metadata = await uploadWeb3Json(data, "metadata.json");
    setMetadata(metadata.cid);
    setStep("MINT");
    setIsSubmitting(false)
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
    setValue("image", uri);
  };
  const uploadBtnClasses = classNames("btn btn-outline btn-primary w-full", {
    loading,
  });
  const onLocationChange = async (
    lat: number,
    lng: number,
    country: Country
  ) => {
    setValue("location.lat", lat);
    setValue("location.lng", lng);
    setValue("location.country", country);
  };
  const disableSubmit =
    !values.image ||
    !values.name ||
    !values.treeSpecies ||
    !values.location.lat ||
    !values.location.lng;
  const metadataUri = `ipfs://${metadata}`
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
                      {values.image ? (
                        <div>
                          <img
                            alt="Upload Preview"
                            className="w-full h-80 object-cover mb-4"
                            src={uriToGatewayUrl(values.image)}
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
                              {values.image
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
                    disabled={!values.image}
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

                    {values?.location?.country?.name ? (
                      <div className="mb-4 text-sm">
                        {values.location.country.name}{" "}
                        <span>
                          ({values.location.lat}, {values.location.lng})
                        </span>
                      </div>
                    ) : (
                      <div className="text-base-content text-opacity-60 mb-2">
                        (Not selected)
                      </div>
                    )}

                    <button
                      className="btn btn-outline btn-primary"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setLocationPickerOpen(true)
                      }}
                    >
                      <LocationMarkerIcon className="w-5 h-5 mr-2" />
                      Pick Location
                    </button>
                    {errors && errors.name && (
                      <span className="label-text-alt text-error-content mt-4">
                        Please, insert a valid name
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t p-4 flex justify-between">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setStep("PHOTO")}
                    disabled={!values.image}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={isSubmitting ? 'btn btn-ghost loading' : 'btn btn-primary'}
                    disabled={disableSubmit}
                  >
                    {isSubmitting ? 'Uploading Metadata...' : 'Next'}
                  </button>
                </div>
              </div>
            )}
            {step === "MINT" && (
              <div>
                <div className="p-8">
                  {accountAddress && (
                    <div>
                      <h1 className="text-lg mb-4">
                        Transaction Summary
                      </h1>
                      <MyTransactionSummary
                        content={[
                          {
                            name: "Token Info",
                            infos: [
                              {
                                label: "Name",
                                value: values.name,
                              },
                              {
                                label: "Tree Species",
                                value: values.treeSpecies,
                              },
                              {
                                label: "Country",
                                value: values.location?.country.name || 'None',
                              },
                              {
                                label: "Longitude",
                                value: values.location?.lng,
                              },
                              {
                                label: "Latitude",
                                value: values.location?.lat,
                              },
                              {
                                label: "Metadata",
                                value: (
                                  <a href={uriToGatewayUrl(metadataUri)} className="text-primary" target="_blank" rel="noreferrer">
                                    ipfs://{getShortString(metadata || '')}
                                  </a>
                                ),
                              }
                            ]
                          },
                          {
                            name: "Gas and Fees",
                            infos: [
                              {
                                label: "Gas",
                                value: "1000",
                              },
                              {
                                label: "Gas Fee",
                                value: "0.005 ETH",
                              },
                              {
                                label: "Total",
                                value: (
                                  <CryptoAmount symbol="ETH" amount={100} style={{ display: 'inline-flex' }} />
                                ),
                              }
                            ]
                          }
                        ]}
                      />
                    </div>
                  )}
                </div>
                <div className="border-t p-4 flex justify-between">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setStep("DETAILS")}
                    disabled={!values.image}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={false}
                  >
                    Mint
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
