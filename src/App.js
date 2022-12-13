import { useState } from "react";
import "./index.css";
import axios from "axios";
const App = () => {
  const [originalImage, setOriginalImage] = useState({
    kb: 0,
    mb: 0,
    src: "",
    imageData: {},
  });

  const [compressedImage, setCompressedImage] = useState({
    kb: 0,
    mb: 0,
    src: "",
    imageData: {},
  });

  const onChangeHandler = (e) => {
    if (e.target.files[0] || e.target.files) {
      let f = e.target.files[0];

      setOriginalImage(() => {
        return {
          kb: Math.round(f.size / 1024),
          mb: Math.round(f.size / 1024 / 1024),
          src: URL.createObjectURL(f),
          imageData: f,
        };
      });

      // Compressing the image
      let compressRatio = 0.4;
      let fileName = f.name.split(".")[0];
      let img = new Image();
      img.src = URL.createObjectURL(f);
      img.onload = function () {
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          function (blob) {
            let newImage = new File([blob], fileName + ".jpeg");
            setCompressedImage(() => {
              return {
                kb: Math.round(newImage.size / 1024),
                mb: Math.round(newImage.size / 1024 / 1024),
                src: URL.createObjectURL(newImage),
                imageData: f,
              };
            });
          },
          "image/jpeg",
          compressRatio
        );
      };
    }
  };

  const onSubmitHandler = () => {
    const formData = new FormData();
    formData.upload("image", compressedImage.imageData);

    var config = {
      onUploadProgress: function (progressEvent) {
        var percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        let uploadProductLoader1 = document.getElementById("fileLoader1");
        uploadProductLoader1.style.width = percentCompleted + "%";
        if (percentCompleted >= 100)
          setTimeout(() => {
            uploadProductLoader1.style.width = "0%";
          }, 1000);
      },
    };

    axios
      .post("/api/v1/file/new", formData, config)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className={"container"}>
      <h3>Super compress</h3>
      <div className="images-container">
        <div>
          <img src={originalImage.src} />
          <p>
            Original image:{" "}
            <b>
              {originalImage.kb} KB / {originalImage.mb} MB
            </b>
          </p>
        </div>
        <div>
          <img src={compressedImage.src} />
          <p>
            Compressed image:{" "}
            <b>
              {compressedImage.kb} KB / {compressedImage.mb} MB
            </b>
          </p>
        </div>
      </div>
      <br />
      <br />
      <br />
      <input type="file" onChange={onChangeHandler} />
      <br />
      <br />
      {compressedImage.kb > 0 && (
        <button onClick={onSubmitHandler}>Upload</button>
      )}
      <div id="fileLoader1"></div>
    </div>
  );
};
export default App;
