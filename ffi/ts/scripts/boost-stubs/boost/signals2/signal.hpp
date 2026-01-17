/**
 * Minimal Boost signals2 stub for WASM builds
 * 
 * This provides just enough of the signals2 interface to compile
 * without the full Boost library.
 */

#ifndef BOOST_SIGNALS2_SIGNAL_HPP
#define BOOST_SIGNALS2_SIGNAL_HPP

#include <functional>
#include <vector>
#include <memory>

namespace boost {
namespace signals2 {

// Minimal connection class
class connection {
public:
    connection() = default;
    void disconnect() {}
    bool connected() const { return false; }
};

// Minimal scoped_connection
class scoped_connection : public connection {
public:
    scoped_connection() = default;
    scoped_connection(const connection& c) : connection(c) {}
    ~scoped_connection() { disconnect(); }
    scoped_connection& operator=(const connection& c) { return *this; }
};

// Minimal signal class template
template<typename Signature>
class signal;

template<typename R, typename... Args>
class signal<R(Args...)> {
public:
    using slot_type = std::function<R(Args...)>;
    
    signal() = default;
    
    connection connect(slot_type slot) {
        slots_.push_back(std::move(slot));
        return connection();
    }
    
    template<typename... CallArgs>
    void operator()(CallArgs&&... args) {
        for (auto& slot : slots_) {
            if (slot) {
                slot(std::forward<CallArgs>(args)...);
            }
        }
    }
    
    bool empty() const { return slots_.empty(); }
    void disconnect_all_slots() { slots_.clear(); }
    
private:
    std::vector<slot_type> slots_;
};

// Optional last value combiner (commonly used)
template<typename T>
struct optional_last_value {
    using result_type = T;
    
    template<typename InputIterator>
    T operator()(InputIterator first, InputIterator last) const {
        T value{};
        while (first != last) {
            value = *first;
            ++first;
        }
        return value;
    }
};

template<>
struct optional_last_value<void> {
    using result_type = void;
    
    template<typename InputIterator>
    void operator()(InputIterator first, InputIterator last) const {
        while (first != last) {
            *first;
            ++first;
        }
    }
};

} // namespace signals2
} // namespace boost

#endif // BOOST_SIGNALS2_SIGNAL_HPP

