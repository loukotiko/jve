/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Card,
  Flex,
  Typography,
  Space,
  Checkbox,
  Row,
  Col,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  CheckOutlined,
  EyeOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import words from "./words";
import { Textfit } from "react-textfit";
import pirateImg from "./assets/ship.jpg";
import pirateBackground from "./assets/pirate_tavern2.jpg";
import fantasyImg from "./assets/fantasy_tavern_cropped.jpg";
import fantasyBackground from "./assets/fantasy_tavern.jpg";
import spaceImg from "./assets/space_exploration.jpg";
import spaceBackground from "./assets/space_room.jpg";
import evilImg from "./assets/goblin_king.jpg";
import evilBackground from "./assets/cave.jpg";

const { Paragraph } = Typography;

const categories = Object.keys(words);

const categoriesLabels = {
  default: "Classique",
  adventure: "Aventures",
  horror: "Halloween",
};

const themes = {
  fantasy: {
    title: "La chanson du Barde",
    img: fantasyImg,
    background: fantasyBackground,
  },
  space: {
    title: "Retour de mission",
    img: spaceImg,
    background: spaceBackground,
  },
  evil: {
    title: "L'anniversaire du Roi Gobelin",
    img: evilImg,
    background: evilBackground,
  },
  secret: {
    title: "Opération S.E.C.R.E.T.",
    img: "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
    background: "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
  },
  horror: {
    title: "Histoires d'horreur",
    img: "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
    background: "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
  },
  pirate: {
    title: "À bon port",
    img: pirateImg,
    background: pirateBackground,
  },
};

function App() {
  const [selectedTheme, setSelectedTheme] = useState();
  const [selectedCategories, setSelectedCategories] = useState(categories);
  const [availableWords, setAvailableWords] = useState([]);
  const [lastSeenWordIndex, setLastSeenWordIndex] = useState(-1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [ended, setEnded] = useState(false);

  const [startPaginatedIndex, setStartPaginatedIndex] = useState(0);

  const allWords = useMemo(
    () =>
      selectedCategories.reduce(
        (allWords, category) => [...words[category], ...allWords],
        []
      ),
    [selectedCategories]
  );

  const paginatedWords = useMemo(() => {
    return availableWords.slice(startPaginatedIndex, startPaginatedIndex + 10);
  }, [startPaginatedIndex, availableWords]);

  const paginationUp = useCallback(() => {
    setStartPaginatedIndex((index) => index - 1);
  }, []);

  const paginationDown = useCallback(() => {
    setStartPaginatedIndex((index) => index + 1);
  }, []);

  const newGame = useCallback(() => {
    setSelectedTheme(undefined);
    setCurrentWordIndex(-1);
    setLastSeenWordIndex(-1);
    setStartPaginatedIndex(0);
    setEnded(false);
  }, []);

  const previous = useCallback(() => {
    setCurrentWordIndex((index) => Math.max(0, index - 1));
  }, []);

  const next = useCallback(() => {
    setCurrentWordIndex((index) => index + 1);
  }, []);

  const selectTheme = useCallback(
    (theme) => {
      setSelectedTheme(theme);
      const newAvailableWords = [...allWords];
      newAvailableWords.sort(() => 0.5 - Math.random());
      setAvailableWords(newAvailableWords);
      next();
    },
    [allWords, next]
  );

  useEffect(() => {
    if (currentWordIndex > lastSeenWordIndex)
      setLastSeenWordIndex(currentWordIndex);
  }, [currentWordIndex]);

  const toggleCategory = useCallback(
    (category) => {
      const isCategorySelected = selectedCategories.includes(category);
      const newSelectedCategories = [...selectedCategories].filter(
        (selectedCategory) => selectedCategory !== category
      );
      if (!isCategorySelected) newSelectedCategories.push(category);
      setSelectedCategories(newSelectedCategories);
    },
    [selectedCategories]
  );

  const copyWords = useCallback(() => {
    navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        navigator.clipboard.writeText(
          availableWords.slice(0, lastSeenWordIndex + 1).join("\n")
        );
      }
    });
  }, [availableWords, lastSeenWordIndex]);

  const endGame = useCallback(() => {
    copyWords();
    setEnded(true);
  }, [copyWords]);

  useEffect(() => {
    newGame();
  }, []);

  if (ended)
    return (
      <Flex
        justify="center"
        align="center"
        style={{
          height: "100%",
          backgroundImage: `url(${themes[selectedTheme].background})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Card
          style={{ width: 800 }}
          bodyStyle={{ textAlign: "center" }}
          actions={[
            <Button onClick={newGame} icon={<SendOutlined />} key="start">
              Démarrer une nouvelle partie
            </Button>,
          ]}
          title="Fin de la partie !"
        >
          <Space direction="vertical" size="small" align="center">
            <Paragraph>
              Il est temps de retrouver tous les mots, dans l&apos;ordre. Vous
              avez <strong>{lastSeenWordIndex + 1} mots</strong> à retrouver !
            </Paragraph>
            <Button
              disabled={startPaginatedIndex === 0}
              onClick={paginationUp}
              shape="circle"
            >
              <ArrowUpOutlined />
            </Button>
            {paginatedWords.map((word) => (
              <Spoiler key={word}>{word}</Spoiler>
            ))}
            <Button
              disabled={startPaginatedIndex + 10 > lastSeenWordIndex}
              onClick={paginationDown}
              shape="circle"
            >
              <ArrowDownOutlined />
            </Button>
          </Space>
        </Card>
      </Flex>
    );

  if (currentWordIndex === -1)
    return (
      <Flex justify="center" align="center" style={{ height: "100%" }}>
        <Card
          style={{ width: 1200 }}
          extra={
            <Space size="small">
              {categories.map((category) => (
                <Checkbox
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                >
                  {categoriesLabels[category]}
                </Checkbox>
              ))}
            </Space>
          }
          title="Choisissez un thème"
        >
          <Row gutter={[16, 16]}>
            {Object.entries(themes).map(([theme, { title, img }]) => (
              <Col span={8} key={theme}>
                <Card
                  type="inner"
                  hoverable
                  bodyStyle={{ textAlign: "center" }}
                  onClick={() => selectTheme(theme)}
                  cover={
                    <img
                      height="240"
                      style={{ objectFit: "cover" }}
                      alt={title}
                      src={img}
                    />
                  }
                >
                  <Card.Meta title={title} />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Flex>
    );

  return (
    <>
      <Flex
        justify="center"
        align="center"
        style={{
          height: "100%",
          backgroundImage: `url(${themes[selectedTheme].background})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Card
          bordered={false}
          style={{ width: 800 }}
          title={`Mot ${currentWordIndex + 1}/${lastSeenWordIndex + 1}`}
          actions={[
            <Button
              onClick={previous}
              icon={<ArrowLeftOutlined />}
              shape="circle"
              key="previous"
            />,
            <Button onClick={endGame} icon={<CheckOutlined />} key="start">
              Terminer la partie
            </Button>,
            <Button
              onClick={next}
              icon={<ArrowRightOutlined />}
              shape="circle"
              key="next"
            />,
          ]}
        >
          <Textfit
            mode="multi"
            style={{
              width: "100%",
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              lineHeight: 1,
              padding: 20,
              boxSizing: "border-box",
            }}
            forceSingleModeWidth={false}
          >
            {availableWords[currentWordIndex]}
          </Textfit>
        </Card>
      </Flex>
    </>
  );
}

export default App;

function Spoiler({ children }) {
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => {
    setRevealed(true);
  }, []);
  const hide = useCallback(() => {
    setRevealed(false);
  }, []);

  return revealed ? (
    <Button onClick={hide} style={{ width: 400 }} type="primary">
      {children}
    </Button>
  ) : (
    <Button
      onClick={reveal}
      icon={<EyeOutlined />}
      style={{ width: 400 }}
      type="dashed"
    />
  );
}