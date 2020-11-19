import { Input } from "design-react-kit";
import React, { ChangeEvent } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import "./Logo.css";

type OwnProps = {
  errorLogoUpload: boolean;
  isSubmitEnabled: boolean;
  isValid: boolean;
  logoPath: string;
  logoUploaded: boolean;
  onChangeHandler: (event: ChangeEvent<HTMLInputElement>) => void;
  onError: () => void;
  onSubmitHandler: () => void;
  nameInput: string;
  nameButton: string;
};

type Props = WithNamespaces & OwnProps;

const Logo = ({
  errorLogoUpload,
  isSubmitEnabled,
  isValid,
  logoPath,
  logoUploaded,
  onChangeHandler,
  onError,
  onSubmitHandler,
  nameInput,
  nameButton,
  t
}: Props) => {
  return (
    <div>
      <div className="form-group">
        <div className="input-group">
          <Input
            className="form-control"
            id={nameInput}
            name={nameInput}
            type="file"
            invalid={!isValid}
            onChangeCapture={onChangeHandler}
            accept=".png"
          />
          <div className="input-group-append">
            <button
              className="btn"
              disabled={!isSubmitEnabled}
              type="button"
              id={nameButton}
              onClick={onSubmitHandler}
            >
              {t(nameButton)}
            </button>
          </div>
        </div>
      </div>
      {logoUploaded && (
        <div>
          <a href={logoPath} target="_blank">
            <img src={logoPath} alt="logo_image" onError={onError} />
          </a>
        </div>
      )}
      {errorLogoUpload && (
        <div className="invalid-feedback d-block">
          {t("errors:upload_logo")}
        </div>
      )}
    </div>
  );
};

export default withNamespaces("service")(Logo);
