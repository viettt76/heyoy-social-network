import Header from '~/components/Header';

const OnlyHeaderLayout = ({ children }) => {
    return (
        <div>
            <Header />
            {children}
        </div>
    );
};

export default OnlyHeaderLayout;
