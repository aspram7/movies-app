import { useEffect, useState, useMemo, useRef } from "react";
import Slider from "react-slick";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import data from "data.json";
import "./style.css";

dayjs.extend(duration);

const settings = {
  slidesToShow: 8,
  slidesToScroll: 8,
  arrows: false,
  infinite: false,
};

type FeatureType = {
  Id: string;
  Date: string;
  Title: string;
  Duration: string;
  VideoUrl?: string;
  Category: string;
  MpaRating: string;
  CoverImage: string;
  TitleImage: string;
  ReleaseYear: string;
  Description: string;
};

const Homepage = () => {
  const sliderRef = useRef<Slider | null>(null);
  const [showImg, setShowImg] = useState(true);
  const [activeFeature, setActiveFeature] = useState<FeatureType>(data.Featured);
  const [tendingData, setTendingData] = useState<Array<FeatureType>>(data.TendingNow);

  const duration = useMemo(
    () =>
      dayjs
        .duration(Number(activeFeature.Duration), "seconds")
        .format(Number(activeFeature.Duration) > 3600 ? "H[h] m[m]" : "m[m]"),
    [activeFeature.Duration]
  );

  useEffect(() => {
    const features = sessionStorage.getItem("features");
    if (features) {
      const activeFeatures: Array<string> = JSON.parse(features);
      const activeFeature = data.TendingNow.find((d) => d.Id === activeFeatures[0]) || data.Featured;

      setActiveFeature(activeFeature);

      const restData = data.TendingNow.filter((d) => !activeFeatures.includes(d.Id));
      const filteredData = activeFeatures.map((id) => data.TendingNow.find((d) => d.Id === id)!);

      setTendingData([...filteredData, ...restData]);
    }
  }, []);

  useEffect(() => {
    const slide = (y: number) => {
      y > 0 ? sliderRef.current?.slickNext() : sliderRef.current?.slickPrev();
    };

    const sliderRefElement = sliderRef.current?.innerSlider?.list;

    sliderRefElement?.addEventListener("wheel", (e) => {
      slide(e.deltaY);
    });

    return () => {
      sliderRefElement?.addEventListener("wheel", (e) => {
        slide(e.deltaY);
      });
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (activeFeature.VideoUrl) {
        setShowImg(false);
      }
    }, 2000);
  }, [activeFeature]);

  const handleClick = (item: FeatureType) => {
    setShowImg(true);
    setActiveFeature(item);

    const features = sessionStorage.getItem("features");
    if (!features) {
      sessionStorage.setItem("features", JSON.stringify([item.Id]));
    } else {
      const featuresArr = [item.Id, ...(JSON.parse(features) as Array<string>)];
      const uniqueFeatures = Array.from(new Set(featuresArr));
      sessionStorage.setItem("features", JSON.stringify(uniqueFeatures));
    }
  };

  return (
    <div className="homepage-container">
      <div className="background">
        {showImg ? (
          <img src={`assets/${activeFeature.CoverImage}`} alt={activeFeature.Description} />
        ) : (
          <video src={activeFeature.VideoUrl} autoPlay loop muted />
        )}
      </div>
      <div className="content">
        <h3>{activeFeature.Category}</h3>
        <img src={`assets/${activeFeature.TitleImage}`} alt={activeFeature.Description} />
        <div className="info">
          <span>{activeFeature.ReleaseYear}</span>
          <span>{activeFeature.MpaRating}</span>
          <span>{duration}</span>
        </div>
        <div className="bio">{activeFeature.Description}</div>
        <div className="buttons">
          <button>Play</button>
          <button className="more-info">More Info</button>
        </div>
      </div>
      <div className="slider">
        <p className="title">Trending Now</p>
        <Slider {...settings} ref={sliderRef}>
          {tendingData.map((item) => {
            return (
              <div className="slider-item" key={item.Id}>
                <div>
                  <img src={`assets/${item.CoverImage}`} alt={item.TitleImage} onClick={() => handleClick(item)} />
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

export default Homepage;
