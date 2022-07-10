import React, { FC, useState } from "react";
import { MainLayout } from "../layouts/MainLayout";
import plantPhotoSrc from "../assets/img/plant-photo.png";
import plantMintedSrc from "../assets/img/plant-minted.png";
import {
  CameraIcon,
  LocationMarkerIcon,
} from "@heroicons/react/outline";
import { useForm } from "react-hook-form";
import { uploadWeb3Files, uploadWeb3Json } from "../lib/uploadFile";
import classNames from "classnames";
import { renameFile } from "../utils/file";
import { LocationPicker } from "../components/LocationPicker";
import { Country } from "../utils/gmaps";
import { uriToGatewayUrl } from "../utils/web3storage";
import {
  MyTransactionSummary,
  CryptoAmount,
} from "react-web3-daisyui/dist/eth";
import { useWeb3 } from "../hooks/useWeb3";
import { getShortString } from "../utils/string";
import { useContract } from "../hooks/useContract";
import { useInterface } from "../hooks/useInterface";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

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

type Step = "PHOTO" | "DETAILS" | "MINT" | "SUCCESS";

const STEPS: Step[] = ["PHOTO", "DETAILS", "MINT", "SUCCESS"];

export const Mint: FC<MintProps> = () => {
  const [step, setStep] = useState<Step>("PHOTO");
  const [loading, setLoading] = useState<boolean>(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [minting, setMinting] = useState<boolean>(false);
  const [mintedToken, setMintedToken] = useState<number | null>(null);
  const [gasPrice, setGasPrice] = useState<number | null>(null);
  const [estimatedGas, setEstimatedGas] = useState<number | null>(null);
  const { ethersProvider } = useWeb3()
  const contract = useContract();
  const iface = useInterface();
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
  const { accountAddress } = useWeb3();
  const metadataUri = `ipfs://${metadata}`;

  const estimateGas = async () => {
    try {
      const gasPrice = await ethersProvider?.getGasPrice()
      const gas = await contract.estimateGas.safeMint(accountAddress, metadataUri);
      setEstimatedGas(gas.toNumber())
      setGasPrice(gasPrice?.toNumber() || null)
    } catch (error) {
      console.error('Could not estimate gas')
    }
  }

  const getGasPriceFormatted = () => {
    if (!gasPrice) {
      return
    }
    const gasPriceAvax = gasPrice * 10**-18
    if (gasPriceAvax) {
      const totalFormatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 8,
        minimumFractionDigits: 8,
      }).format(gasPriceAvax)
      return `${totalFormatted}`
    }
    return null
  }

  const getTotalGasFee = () => {
    if (!gasPrice || !estimatedGas) {
      return 0
    }
    const gasPriceAvax = gasPrice * 10**-18
    const total = gasPriceAvax * estimatedGas
    return total
  }

  const getTotalGasFeeFormatted = () => {
    if (!gasPrice || !estimatedGas) {
      return
    }
    const gasPriceAvax = gasPrice * 10**-18
    const total = gasPriceAvax * estimatedGas
    if (total) {
      const totalFormatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 4,
        minimumFractionDigits: 4,
      }).format(total)
      return `${totalFormatted}`
    }
    return null
  }

  const mint = async (): Promise<void> => {
    setMinting(true);
    const txSent = await contract.safeMint(accountAddress, metadataUri, {
      gasPrice,
    });
    const tx = await txSent.wait();
    if (tx.logs.length === 0) {
      // TODO: add toast alert here
      console.error("Could not parse tx logs");
      setMinting(false);
      return;
    }
    const log = iface.parseLog(tx.logs[0]);
    setMintedToken(log.args.tokenId.toNumber());
    setStep("SUCCESS");
    setMinting(false);
  };

  const onSubmit = async (data: FormValues) => {
    if (!data.location.country) {
      return;
    }
    if (step !== "DETAILS") {
      return;
    }
    setIsSubmitting(true);
    const metadata = await uploadWeb3Json(data, "metadata.json");
    setMetadata(metadata.cid);
    estimateGas()
    setStep("MINT");
    setIsSubmitting(false);
  };

  const renderProgress = () => {
    const currentIdx = STEPS.findIndex((s) => s === step);
    const getClassName = (idx: number) =>
      currentIdx < idx ? "step" : "step step-primary";
    return (
      <ul className="steps w-full">
        {["Plant", "Details", "Mint", "Success"].map((label, idx) => (
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
                        e.preventDefault();
                        setLocationPickerOpen(true);
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
                    className={
                      isSubmitting ? "btn btn-ghost loading" : "btn btn-primary"
                    }
                    disabled={disableSubmit}
                  >
                    {isSubmitting ? "Uploading Metadata..." : "Next"}
                  </button>
                </div>
              </div>
            )}
            {step === "MINT" && (
              <div>
                <div className="p-8">
                  {accountAddress && (
                    <div>
                      <h1 className="text-lg mb-4">Transaction Summary</h1>
                      <MyTransactionSummary
                        symbol="AVAX"
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
                                label: "Metadata",
                                value: (
                                  <a
                                    href={uriToGatewayUrl(metadataUri)}
                                    className="text-primary"
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    ipfs://{getShortString(metadata || "")}
                                  </a>
                                ),
                              },
                            ],
                          },
                          {
                            name: "Gas and Fees",
                            infos: [
                              {
                                label: "Gas Price",
                                value: `${getGasPriceFormatted() || '-'} AVAX`,
                              },
                              {
                                label: "Gas Fee",
                                value: `${getTotalGasFeeFormatted() || '-'} AVAX`,
                              },
                              {
                                label: "Total",
                                value: (
                                  <CryptoAmount
                                    symbol="AVAX"
                                    amount={getTotalGasFee()}
                                    style={{ display: "inline-flex" }}
                                  />
                                ),
                              },
                            ],
                          },
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
                    className={classNames("btn btn-primary", {
                      loading: minting,
                    })}
                    disabled={!metadata}
                    onClick={() => mint()}
                  >
                    {minting ? "Minting..." : "Mint"}
                  </button>
                </div>
              </div>
            )}
            {step === "SUCCESS" && (
              <div>
                <div className="p-8">
                  <img
                    alt="Tree Minted"
                    className="w-64 h-64 object-cover mb-4 mx-auto"
                    src={plantMintedSrc}
                  />
                  <div className="text-center font-semibold text-2xl">
                    Success!
                  </div>
                  <div className="text-center mt-2">
                    You contributed to reforestation!
                  </div>
                  <div className="text-center">
                    <Link
                      to={`/tokens/${mintedToken}`}
                      className="btn btn-primary btn-outline mt-8"
                    >
                      View Token #{mintedToken}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  );
};
